import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

// Rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT_MAX_REQUESTS = 50
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute in milliseconds

interface EmailMetadata {
    from: string
    subject: string
    date: string
    attachments?: Array<{
        filename: string
        type: string
        size: number
    }>
}

interface ConversationMessage {
    role: 'user' | 'assistant'
    content: string
    timestamp: string
}

interface AgentRequest {
    emailContent: string
    emailMetadata: EmailMetadata
    conversationHistory?: ConversationMessage[]
    userPreferences?: Record<string, any>
}

interface TriageDecision {
    action: 'auto_respond' | 'needs_review' | 'schedule_meeting' | 'forward'
    confidence: number
    reasoning: string
}

interface ExtractedData {
    formType?: string
    taxYear?: string
    amounts?: Record<string, number>
    dates?: Record<string, string>
}

interface SuggestedAction {
    type: string
    description: string
}

interface AgentResponse {
    response: string
    triage: TriageDecision
    extractedData?: ExtractedData
    suggestedActions?: SuggestedAction[]
}

function checkRateLimit(userKey: string): boolean {
    const now = Date.now()
    const userLimit = rateLimitStore.get(userKey)

    if (!userLimit || now > userLimit.resetTime) {
        rateLimitStore.set(userKey, {
            count: 1,
            resetTime: now + RATE_LIMIT_WINDOW,
        })
        return true
    }

    if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
        return false
    }

    userLimit.count++
    return true
}

function extractTaxInformation(content: string, subject: string): ExtractedData {
    const extractedData: ExtractedData = {}

    // Extract tax form types
    const formPatterns = [
        { pattern: /\b1040\b/gi, type: '1040' },
        { pattern: /\bW-?2\b/gi, type: 'W-2' },
        { pattern: /\b1099[-\s]?[A-Z]*\b/gi, type: '1099' },
        { pattern: /\b1120\b/gi, type: '1120' },
        { pattern: /\b1065\b/gi, type: '1065' },
        { pattern: /\bSchedule [A-Z]\b/gi, type: 'Schedule' },
        { pattern: /\b8829\b/gi, type: '8829' },
    ]

    for (const { pattern, type } of formPatterns) {
        if (pattern.test(content) || pattern.test(subject)) {
            extractedData.formType = type
            break
        }
    }

    // Extract tax years
    const yearMatch =
        content.match(/\b(20\d{2})\s*tax\s*(year|return)/i) || subject.match(/\b(20\d{2})\s*tax\s*(year|return)/i)
    if (yearMatch) {
        extractedData.taxYear = yearMatch[1]
    }

    // Extract monetary amounts
    const amounts: Record<string, number> = {}
    const amountPatterns = [
        { pattern: /refund[:\s]*\$?([\d,]+\.?\d*)/gi, key: 'refund' },
        { pattern: /owe[d]?[:\s]*\$?([\d,]+\.?\d*)/gi, key: 'owed' },
        { pattern: /withh[e]?ld[:\s]*\$?([\d,]+\.?\d*)/gi, key: 'withheld' },
        { pattern: /AGI[:\s]*\$?([\d,]+\.?\d*)/gi, key: 'agi' },
        { pattern: /income[:\s]*\$?([\d,]+\.?\d*)/gi, key: 'income' },
    ]

    for (const { pattern, key } of amountPatterns) {
        const matches = Array.from(content.matchAll(pattern))
        for (const match of matches) {
            const amount = parseFloat(match[1].replace(/,/g, ''))
            if (!isNaN(amount)) {
                amounts[key] = amount
                break
            }
        }
    }

    if (Object.keys(amounts).length > 0) {
        extractedData.amounts = amounts
    }

    // Extract important dates
    const dates: Record<string, string> = {}
    const datePatterns = [
        { pattern: /deadline[:\s]*(\w+\s+\d{1,2},?\s+\d{4})/gi, key: 'deadline' },
        { pattern: /due[:\s]*(\w+\s+\d{1,2},?\s+\d{4})/gi, key: 'due_date' },
        { pattern: /extension[:\s]*(\w+\s+\d{1,2},?\s+\d{4})/gi, key: 'extension' },
    ]

    for (const { pattern, key } of datePatterns) {
        const match = content.match(pattern)
        if (match) {
            dates[key] = match[1]
        }
    }

    if (Object.keys(dates).length > 0) {
        extractedData.dates = dates
    }

    return extractedData
}

function analyzeEmailContent(emailContent: string, metadata: EmailMetadata): TriageDecision {
    const content = emailContent.toLowerCase()
    const subject = metadata.subject.toLowerCase()

    // High priority patterns that need review
    const highPriorityPatterns = [
        /audit/i,
        /irs notice/i,
        /urgent/i,
        /deadline/i,
        /past due/i,
        /penalty/i,
        /error/i,
        /correction/i,
        /amended/i,
    ]

    // Meeting request patterns
    const meetingPatterns = [/schedule/i, /appointment/i, /meeting/i, /call me/i, /discuss/i, /consultation/i]

    // Auto-respond patterns (simple questions)
    const autoRespondPatterns = [/status/i, /when.*ready/i, /deadline.*form/i, /how.*long/i, /fee/i, /cost/i, /price/i]

    let confidence = 0.7 // Base confidence
    let action: TriageDecision['action'] = 'needs_review'
    let reasoning = 'Email requires human review for proper assessment'

    // Check for high priority issues
    if (highPriorityPatterns.some((pattern) => pattern.test(content) || pattern.test(subject))) {
        action = 'needs_review'
        confidence = 0.95
        reasoning = 'Email contains urgent tax matters or IRS communications requiring immediate attention'
    }
    // Check for meeting requests
    else if (meetingPatterns.some((pattern) => pattern.test(content) || pattern.test(subject))) {
        action = 'schedule_meeting'
        confidence = 0.85
        reasoning = 'Email appears to be requesting a meeting or consultation'
    }
    // Check for simple questions that can be auto-responded
    else if (autoRespondPatterns.some((pattern) => pattern.test(content) || pattern.test(subject))) {
        action = 'auto_respond'
        confidence = 0.8
        reasoning = 'Email contains standard questions that can be answered with template responses'
    }
    // Check for forwarding needs
    else if (content.includes('specialist') || content.includes('cpa') || content.includes('accountant')) {
        action = 'forward'
        confidence = 0.75
        reasoning = 'Email may need to be forwarded to a tax specialist'
    }

    return { action, confidence, reasoning }
}

function generateResponse(
    emailContent: string,
    metadata: EmailMetadata,
    extractedData: ExtractedData,
    triage: TriageDecision
): string {
    const senderName = metadata.from.split('@')[0] || 'Client'

    if (triage.action === 'auto_respond') {
        if (emailContent.toLowerCase().includes('status')) {
            return `Dear ${senderName},

Thank you for your inquiry about the status of your tax return.

I'm currently reviewing your ${extractedData.formType || 'tax'} documents${extractedData.taxYear ? ` for tax year ${extractedData.taxYear}` : ''}. Based on the complexity of your return, I expect to have it completed within the next 3-5 business days.

I'll send you an update as soon as your return is ready for review.

If you have any urgent questions, please don't hesitate to call me directly.

Best regards,
Tax Professional`
        }

        if (emailContent.toLowerCase().includes('deadline')) {
            return `Dear ${senderName},

Thank you for asking about tax deadlines.

For the ${extractedData.taxYear || '2024'} tax year:
- Individual returns (Form 1040): April 15, 2024
- Corporate returns (Form 1120): April 15, 2024 (with extension to October 15)
- Partnership returns (Form 1065): March 15, 2024 (with extension to September 15)

${extractedData.formType ? `For your ${extractedData.formType} form specifically, ` : ''}I recommend filing at least a week before the deadline to account for any last-minute issues.

Please let me know if you need an extension filed.

Best regards,
Tax Professional`
        }
    }

    if (triage.action === 'schedule_meeting') {
        return `Dear ${senderName},

Thank you for reaching out regarding your tax matters.

I'd be happy to schedule a consultation to discuss ${extractedData.formType ? `your ${extractedData.formType} form` : 'your tax situation'} in detail. 

Please let me know your availability for the following times:
- This week: Tuesday or Thursday afternoon
- Next week: Monday, Wednesday, or Friday morning

We can meet in person, via video call, or over the phone - whatever works best for you.

In preparation for our meeting, please have the following documents ready:
${extractedData.formType === '1040' ? '- W-2 forms from all employers\n- 1099 forms for any additional income\n- Receipts for deductible expenses' : "- All relevant tax documents\n- Previous year's tax return\n- Any correspondence from the IRS"}

Looking forward to working with you.

Best regards,
Tax Professional`
    }

    // Default response for needs_review
    return `Dear ${senderName},

Thank you for your email regarding ${extractedData.formType ? `your ${extractedData.formType} form` : 'your tax matter'}.

I've received your message and will review the details carefully. ${extractedData.amounts ? "I note the financial figures you've mentioned and " : ''}I'll provide you with a comprehensive response within 24 hours.

${triage.reasoning.includes('urgent') ? "Given the urgent nature of your inquiry, I'll prioritize this matter." : ''}

If you have any additional documents to share, please feel free to attach them to a reply.

Best regards,
Tax Professional`
}

function generateSuggestedActions(
    extractedData: ExtractedData,
    triage: TriageDecision,
    metadata: EmailMetadata
): SuggestedAction[] {
    const actions: SuggestedAction[] = []

    // Always suggest categorizing the email
    actions.push({
        type: 'categorize',
        description: `Move to ${extractedData.formType || 'General Tax'} folder`,
    })

    // Suggest actions based on extracted data
    if (extractedData.formType) {
        actions.push({
            type: 'link_document',
            description: `Link to existing ${extractedData.formType} documents for this client`,
        })
    }

    if (extractedData.dates) {
        actions.push({
            type: 'set_reminder',
            description: 'Set calendar reminder for mentioned deadlines',
        })
    }

    if (extractedData.amounts) {
        actions.push({
            type: 'update_client_record',
            description: 'Update client record with mentioned financial figures',
        })
    }

    // Actions based on triage decision
    if (triage.action === 'schedule_meeting') {
        actions.push({
            type: 'calendar_integration',
            description: 'Open calendar to schedule appointment',
        })
    }

    if (triage.action === 'forward') {
        actions.push({
            type: 'find_specialist',
            description: 'Find appropriate tax specialist for referral',
        })
    }

    if (metadata.attachments && metadata.attachments.length > 0) {
        actions.push({
            type: 'process_attachments',
            description: 'Scan and categorize attached documents',
        })
    }

    return actions
}

export async function POST(request: Request) {
    try {
        // Check authentication
        const session = await auth()
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
        }

        // Rate limiting check
        const userKey = session.user.email
        if (!checkRateLimit(userKey)) {
            return NextResponse.json({ error: 'Rate limit exceeded. Maximum 50 requests per minute.' }, { status: 429 })
        }

        // Parse request body
        const body: AgentRequest = await request.json()

        if (!body.emailContent || !body.emailMetadata) {
            return NextResponse.json(
                { error: 'Invalid request. Email content and metadata are required.' },
                { status: 400 }
            )
        }

        // Simulate processing delay for realistic experience
        await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 2000))

        // Extract tax-specific information
        const extractedData = extractTaxInformation(body.emailContent, body.emailMetadata.subject)

        // Analyze email for triage decision
        const triage = analyzeEmailContent(body.emailContent, body.emailMetadata)

        // Generate response
        const response = generateResponse(body.emailContent, body.emailMetadata, extractedData, triage)

        // Generate suggested actions
        const suggestedActions = generateSuggestedActions(extractedData, triage, body.emailMetadata)

        const agentResponse: AgentResponse = {
            response,
            triage,
            extractedData,
            suggestedActions,
        }

        return NextResponse.json(agentResponse)
    } catch (error) {
        console.error('Email agent API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function GET() {
    return NextResponse.json({ error: 'Method not allowed. Use POST to analyze emails.' }, { status: 405 })
}
