import { NextRequest, NextResponse } from 'next/server'

interface ChatMessage {
  id: string
  content: string
  type: 'text' | 'calculation' | 'document' | 'form_reference' | 'deadline_reminder'
  sender: 'user' | 'assistant'
  timestamp: string
  threadId?: string
  parentMessageId?: string
  attachments?: Array<{
    id: string
    name: string
    type: string
    size: number
    url: string
    ocrData?: any
  }>
  metadata?: {
    formReferences?: string[]
    calculationData?: any
    piiDetected?: boolean
    confidenceScore?: number
    taxTopic?: string
    isBookmarked?: boolean
    complianceNote?: string
  }
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
}

// In-memory storage for demo purposes
const chatMessages = new Map<string, ChatMessage[]>()
const chatThreads = new Map<string, any>()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const threadId = searchParams.get('threadId') || 'default'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search')
    const taxTopic = searchParams.get('taxTopic')
    const messageType = searchParams.get('messageType')

    let messages = chatMessages.get(threadId) || []

    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase()
      messages = messages.filter(msg =>
        msg.content.toLowerCase().includes(searchLower) ||
        msg.metadata?.taxTopic?.toLowerCase().includes(searchLower) ||
        msg.metadata?.formReferences?.some(ref => ref.toLowerCase().includes(searchLower))
      )
    }

    if (taxTopic && taxTopic !== 'all') {
      messages = messages.filter(msg => msg.metadata?.taxTopic === taxTopic)
    }

    if (messageType && messageType !== 'all') {
      messages = messages.filter(msg => msg.type === messageType)
    }

    // Sort by timestamp (newest first)
    messages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Paginate
    const paginatedMessages = messages.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      messages: paginatedMessages,
      total: messages.length,
      hasMore: offset + limit < messages.length
    })

  } catch (error) {
    console.error('Error fetching chat messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat messages' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      content, 
      type = 'text', 
      threadId = 'default', 
      parentMessageId,
      attachments,
      metadata 
    } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      )
    }

    // Create user message
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      content: content.trim(),
      type,
      sender: 'user',
      timestamp: new Date().toISOString(),
      threadId,
      parentMessageId,
      attachments,
      metadata: {
        ...metadata,
        piiDetected: detectPII(content),
        taxTopic: extractTaxTopic(content)
      },
      status: 'sent'
    }

    // Store user message
    const existingMessages = chatMessages.get(threadId) || []
    chatMessages.set(threadId, [...existingMessages, userMessage])

    // Generate assistant response
    const assistantResponse = await generateAssistantResponse(content, metadata)
    
    const assistantMessage: ChatMessage = {
      id: `msg-${Date.now()}-assistant`,
      content: assistantResponse.content,
      type: assistantResponse.type,
      sender: 'assistant',
      timestamp: new Date().toISOString(),
      threadId,
      metadata: {
        ...assistantResponse.metadata,
        complianceNote: 'This information is for educational purposes only. Consult a tax professional for personalized advice.'
      },
      status: 'read'
    }

    // Store assistant message
    const updatedMessages = chatMessages.get(threadId) || []
    chatMessages.set(threadId, [...updatedMessages, assistantMessage])

    return NextResponse.json({
      success: true,
      userMessage,
      assistantMessage
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating chat message:', error)
    return NextResponse.json(
      { error: 'Failed to create chat message' },
      { status: 500 }
    )
  }
}

function detectPII(content: string): boolean {
  const piiPatterns = [
    /\b\d{3}-\d{2}-\d{4}\b/, // SSN
    /\b\d{2}-\d{7}\b/, // EIN
    /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, // Credit card
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
    /\b\d{3}[\s-]?\d{3}[\s-]?\d{4}\b/ // Phone
  ]
  
  return piiPatterns.some(pattern => pattern.test(content))
}

function extractTaxTopic(content: string): string {
  const topics = {
    'income_tax': ['income', 'wage', 'salary', 'earnings', 'w-2', '1099', 'tax calculation'],
    'deductions': ['deduction', 'deduct', 'write off', 'expense', 'itemized', 'standard deduction'],
    'credits': ['credit', 'tax credit', 'child tax credit', 'earned income credit', 'eic'],
    'deadlines': ['deadline', 'due date', 'extension', 'filing date', 'april 15'],
    'business': ['business', 'self employed', 'schedule c', 'llc', 'corporation', 'partnership'],
    'document_analysis': ['document', 'upload', 'scan', 'ocr', 'analyze'],
    'forms': ['form', '1040', 'schedule', 'w-2', '1099', 'tax form']
  }

  const contentLower = content.toLowerCase()
  for (const [topic, keywords] of Object.entries(topics)) {
    if (keywords.some(keyword => contentLower.includes(keyword))) {
      return topic
    }
  }
  return 'general'
}

async function generateAssistantResponse(userContent: string, metadata?: any): Promise<any> {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 500))

  const contentLower = userContent.toLowerCase()

  // Tax calculation responses
  if (contentLower.includes('calculate') || contentLower.includes('tax') || contentLower.includes('income')) {
    return {
      content: `I can help you calculate your taxes. Based on your question, here's what I found:

**Income Tax Calculation:**
Let me walk you through a sample calculation:

• **Gross Income:** $75,000
• **Standard Deduction (2024):** $14,600
• **Taxable Income:** $60,400
• **Federal Tax (estimated):** $6,905
• **Effective Tax Rate:** 9.2%

Would you like me to create a personalized calculation based on your specific situation? I can help with:
- Income tax calculations
- Deduction optimization
- Tax credit eligibility
- Estimated payment planning`,
      type: 'calculation',
      metadata: {
        taxTopic: 'income_tax',
        confidenceScore: 0.88,
        formReferences: ['1040'],
        calculationData: {
          grossIncome: 75000,
          standardDeduction: 14600,
          taxableIncome: 60400,
          federalTax: 6905,
          effectiveRate: 9.2
        }
      }
    }
  }

  // Deduction responses
  if (contentLower.includes('deduction') || contentLower.includes('deduct')) {
    return {
      content: `Here's a comprehensive guide to tax deductions for 2024:

**Standard vs. Itemized Deductions:**
• **Standard Deduction 2024:**
  - Single: $14,600
  - Married Filing Jointly: $29,200
  - Head of Household: $21,900

**Common Itemized Deductions:**
• **Medical Expenses** (>7.5% of AGI)
• **State and Local Taxes** (up to $10,000)
• **Mortgage Interest** (on qualified residence)
• **Charitable Contributions**

**Business Deductions:**
• Office supplies and equipment
• Business meals (50% deductible)
• Home office expenses
• Professional development
• Business travel

**Pro Tip:** You should itemize only if your total itemized deductions exceed your standard deduction.

Which specific deductions would you like to explore further?`,
      type: 'text',
      metadata: {
        taxTopic: 'deductions',
        confidenceScore: 0.95,
        formReferences: ['Schedule A', '1040', 'Schedule C']
      }
    }
  }

  // Form-specific responses
  if (contentLower.includes('1040') || contentLower.includes('form')) {
    return {
      content: `I can help you with various tax forms. Here are the most common ones:

**Individual Tax Forms:**
• **Form 1040** - U.S. Individual Income Tax Return
• **Schedule A** - Itemized Deductions
• **Schedule B** - Interest and Ordinary Dividends
• **Schedule C** - Profit or Loss from Business
• **Schedule D** - Capital Gains and Losses

**Business Tax Forms:**
• **Form 1120** - U.S. Corporation Income Tax Return
• **Form 1065** - U.S. Return of Partnership Income
• **Form 1120S** - U.S. Income Tax Return for S Corporation

**Information Returns:**
• **Form W-2** - Wage and Tax Statement
• **Form 1099-MISC** - Miscellaneous Income
• **Form 1099-INT** - Interest Income

Which specific form do you need help with? I can provide detailed guidance on:
- Required information and documentation
- Line-by-line completion instructions
- Common mistakes to avoid
- Filing deadlines and extensions`,
      type: 'form_reference',
      metadata: {
        taxTopic: 'forms',
        confidenceScore: 0.92,
        formReferences: ['1040', 'Schedule A', 'Schedule B', 'Schedule C', 'Schedule D', '1120', '1065']
      }
    }
  }

  // Deadline responses
  if (contentLower.includes('deadline') || contentLower.includes('due') || contentLower.includes('when')) {
    return {
      content: `📅 **Important Tax Deadlines for 2024:**

**Individual Returns:**
• **April 15, 2024** - Form 1040 due date
• **October 15, 2024** - Extended deadline (if extension filed by April 15)

**Business Returns:**
• **March 15, 2024** - S-Corp (1120S) and Partnership (1065) returns
• **April 15, 2024** - C-Corp (1120) returns

**Quarterly Estimated Payments:**
• **Q4 2024:** January 15, 2025
• **Q1 2025:** April 15, 2025
• **Q2 2025:** June 16, 2025
• **Q3 2025:** September 15, 2025

**Important Notes:**
⚠️ **Late Filing Penalties:** 5% per month of unpaid taxes
⚠️ **Late Payment Penalties:** 0.5% per month of unpaid taxes
⚠️ **Interest:** Compounded daily on unpaid amounts

**Need an Extension?**
- File Form 4868 for individual returns
- Extensions give you 6 more months to file
- You must still pay estimated taxes by the original deadline

Would you like me to set up deadline reminders for your specific situation?`,
      type: 'deadline_reminder',
      metadata: {
        taxTopic: 'deadlines',
        confidenceScore: 0.98,
        formReferences: ['4868', '1040', '1120', '1065']
      }
    }
  }

  // Document analysis responses
  if (contentLower.includes('document') || contentLower.includes('upload') || contentLower.includes('analyze')) {
    return {
      content: `I can help analyze your tax documents! Here's what I can do:

**Supported Document Types:**
• **Tax Forms:** W-2, 1099s, 1098, K-1s
• **Business Records:** Receipts, invoices, bank statements
• **Investment Documents:** 1099-B, brokerage statements
• **Real Estate:** 1098 mortgage interest, property tax bills

**Document Analysis Features:**
🔍 **OCR Text Extraction** - Extract text from images and PDFs
📊 **Key Data Identification** - Automatically identify important tax information
✅ **Data Validation** - Check for completeness and accuracy
📋 **Form Mapping** - Show how data fits into tax forms

**How to Upload Documents:**
1. Drag and drop files into the chat
2. Or click the paperclip icon to browse files
3. Supported formats: PDF, JPG, PNG, TIFF

**What I'll Extract:**
• Income amounts and sources
• Tax withholdings
• Deductible expenses
• Important dates and deadlines
• Employer/payer information

Go ahead and upload your documents - I'll analyze them and help you understand how to use the information on your tax return!`,
      type: 'document',
      metadata: {
        taxTopic: 'document_analysis',
        confidenceScore: 0.90,
        formReferences: ['W-2', '1099', '1098', 'K-1']
      }
    }
  }

  // Default helpful response
  return {
    content: `I'm here to help with your tax questions! I understand you're asking about "${userContent}".

**I can assist you with:**
• 📊 **Tax Calculations** - Income tax, deductions, credits, estimated payments
• 📄 **Form Guidance** - 1040, Schedule A/C, business forms, and more
• 📁 **Document Analysis** - Upload and analyze W-2s, 1099s, receipts
• 📅 **Deadline Management** - Important dates, extensions, penalties
• 💡 **Tax Planning** - Strategies to minimize your tax burden
• 🔍 **Tax Law Questions** - Current regulations and requirements

**To get more specific help, try asking:**
- "How do I calculate my income tax?"
- "What deductions can I claim?"
- "When is my tax return due?"
- "Can you analyze this W-2?"
- "How do I fill out Schedule C?"

What specific tax topic would you like to explore? Feel free to upload any relevant documents!`,
    type: 'text',
    metadata: {
      taxTopic: 'general',
      confidenceScore: 0.75
    }
  }
}
