import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

// Rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT_MAX_REQUESTS = 30
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute in milliseconds

interface AgentRequest {
    prompt: string
}

interface AgentResponse {
    response: string
}

// Tax-specific agent responses for demonstration
const taxAgentResponses = {
    'form classification': `## Form Classification Results

Based on your input, I can help classify your tax forms. Here are the most common tax forms:

| Form Type | Purpose | Who Should Use |
|-----------|---------|----------------|
| **1040** | Individual Income Tax Return | Most individual taxpayers |
| **1099-MISC** | Miscellaneous Income | Independent contractors, freelancers |
| **W-2** | Wage and Tax Statement | Employees |
| **1120** | Corporate Income Tax Return | C-Corporations |
| **1065** | Partnership Return | Partnerships |

### Next Steps:
1. Upload your document for accurate classification
2. I'll analyze the form structure and content
3. Provide specific guidance for your form type`,

    'extract data': `## Data Extraction Process

I'll help you extract key information from your tax documents:

### Extraction Capabilities:
- **Personal Information**: Name, SSN, Address
- **Income Data**: Wages, Interest, Dividends, Business Income
- **Deductions**: Itemized vs Standard Deductions
- **Tax Credits**: Child Tax Credit, EITC, Education Credits
- **Tax Calculations**: Federal/State Tax Owed or Refund

### Process:
1. **Upload Document** → I'll scan and analyze
2. **Field Recognition** → Identify form fields automatically
3. **Data Validation** → Verify extracted information
4. **Export Options** → JSON, CSV, or formatted report

**Ready to start?** Upload your tax document to begin extraction.`,

    'filing deadline': `## 2024 Tax Filing Deadlines

### Important Dates:

#### Federal Tax Deadlines:
- **April 15, 2024** - Individual tax returns (Form 1040)
- **March 15, 2024** - S-Corp returns (Form 1120S)
- **March 15, 2024** - Partnership returns (Form 1065)
- **April 15, 2024** - C-Corp returns (Form 1120)

#### Extension Deadlines:
- **October 15, 2024** - Extended individual returns
- **September 15, 2024** - Extended corporate returns

#### Quarterly Estimated Tax Payments:
- **Q1**: April 15, 2024
- **Q2**: June 17, 2024
- **Q3**: September 16, 2024
- **Q4**: January 15, 2025

> ⚠️ **Important**: These are federal deadlines. State deadlines may vary.`,

    default: `## Tax Assistant Ready to Help! 🎯

I'm your AI tax assistant, equipped with specialized knowledge to help you with:

### Core Services:
1. **Form Classification** - Identify and categorize tax forms
2. **Data Extraction** - Extract information from tax documents
3. **Form Guidance** - Understand complex form fields
4. **Deadline Information** - Stay on top of filing deadlines
5. **Tax Calculations** - Verify computations and estimates

### How I Work:
I use advanced document analysis and tax knowledge to provide accurate, helpful guidance. I can process various document formats and provide structured responses.

**What would you like help with today?**`,
}

function checkRateLimit(userKey: string): boolean {
    const now = Date.now()
    const userLimit = rateLimitStore.get(userKey)

    if (!userLimit || now > userLimit.resetTime) {
        // Reset or create new limit window
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

function getAgentResponse(prompt: string): string {
    const lowercasePrompt = prompt.toLowerCase()

    if (lowercasePrompt.includes('classify') || lowercasePrompt.includes('form type')) {
        return taxAgentResponses['form classification']
    }

    if (lowercasePrompt.includes('extract') || lowercasePrompt.includes('data')) {
        return taxAgentResponses['extract data']
    }

    if (lowercasePrompt.includes('deadline') || lowercasePrompt.includes('due date')) {
        return taxAgentResponses['filing deadline']
    }

    // For complex queries, provide contextual responses
    if (lowercasePrompt.includes('1040')) {
        return `## Form 1040 Assistance

Form 1040 is the standard Individual Income Tax Return. Here's what you need to know:

### Key Sections:
- **Lines 1-8b**: Income (wages, interest, dividends, etc.)
- **Line 9**: Adjusted Gross Income (AGI)
- **Lines 10-11**: Standard or Itemized Deductions
- **Line 12**: Taxable Income
- **Lines 13-14**: Tax Calculation
- **Lines 15-24**: Credits and Payments

### Common Issues:
1. **Missing Forms**: Ensure you have all W-2s, 1099s
2. **AGI Calculation**: Double-check income additions
3. **Deduction Choice**: Compare standard vs itemized
4. **Credit Eligibility**: Review qualification requirements

**Need help with a specific line or section?** Just ask!`
    }

    if (lowercasePrompt.includes('business') || lowercasePrompt.includes('schedule c')) {
        return `## Business Tax Assistance

For business income and expenses, here's your guidance:

### Schedule C (Sole Proprietorship):
- **Part I**: Income reporting
- **Part II**: Expense deductions
- **Part III**: Cost of Goods Sold (if applicable)

### Key Business Deductions:
- Office expenses and supplies
- Business use of home
- Vehicle expenses
- Professional services
- Equipment depreciation

### Record Keeping Tips:
1. Maintain detailed expense records
2. Separate business and personal expenses
3. Keep receipts for all deductions
4. Track mileage for vehicle deductions

**What aspect of business taxes do you need help with?**`
    }

    return taxAgentResponses['default']
}

export async function POST(request: Request) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
        }

        // Rate limiting check
        const userKey = session.user.email
        if (!checkRateLimit(userKey)) {
            return NextResponse.json({ error: 'Rate limit exceeded. Maximum 30 requests per minute.' }, { status: 429 })
        }

        // Parse request body
        const body: AgentRequest = await request.json()

        if (!body.prompt || typeof body.prompt !== 'string') {
            return NextResponse.json({ error: 'Invalid request. Prompt is required.' }, { status: 400 })
        }

        if (body.prompt.length > 5000) {
            return NextResponse.json({ error: 'Prompt too long. Maximum 5000 characters allowed.' }, { status: 400 })
        }

        // Simulate processing delay for realistic experience
        await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

        // Get agent response based on prompt
        const response = getAgentResponse(body.prompt)

        const agentResponse: AgentResponse = {
            response,
        }

        return NextResponse.json(agentResponse)
    } catch (error) {
        console.error('Agent API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function GET() {
    return NextResponse.json({ error: 'Method not allowed. Use POST to invoke agent.' }, { status: 405 })
}
