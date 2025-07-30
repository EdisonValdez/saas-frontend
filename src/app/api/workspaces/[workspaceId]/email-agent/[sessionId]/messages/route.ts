import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserServer } from '@/lib/session'

export async function POST(
    request: NextRequest,
    { params }: { params: { workspaceId: string; sessionId: string } }
) {
    try {
        const user = await getCurrentUserServer()
        
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { prompt, clientId, agentType } = body

        if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
            return NextResponse.json(
                { error: 'Message content is required' },
                { status: 400 }
            )
        }

        // Mock AI response generation - in production, this would call your AI service
        const userMessage = {
            id: `email-msg-user-${Date.now()}`,
            user: user,
            session: params.sessionId,
            role: 'user',
            content: prompt.trim(),
            created_at: new Date().toISOString(),
        }

        // Generate a contextual AI response based on the prompt
        let aiResponseContent = ''
        let emailMetadata: any = {}
        const lowerPrompt = prompt.toLowerCase()

        if (lowerPrompt.includes('follow up') || lowerPrompt.includes('follow-up')) {
            aiResponseContent = `Here's a professional follow-up email template:

**Subject: Following Up on Our Previous Correspondence**

Dear [Client Name],

I hope this message finds you well. I wanted to follow up on our previous communication regarding [specific topic].

To ensure we're moving forward efficiently, I wanted to check if:
- You have any questions about the information I provided
- You need any additional clarification
- There are any documents or details you'd like me to review

Please don't hesitate to reach out if you need any assistance. I'm here to help ensure everything proceeds smoothly.

Best regards,
[Your Name]

Would you like me to customize this template for your specific situation?`
            
            emailMetadata = {
                subject: 'Following Up on Our Previous Correspondence',
                recipients: ['client@example.com']
            }
        } else if (lowerPrompt.includes('deadline') || lowerPrompt.includes('extension')) {
            aiResponseContent = `Here's a professional email addressing deadline concerns:

**Subject: Important Information About Tax Filing Deadlines**

Dear [Client Name],

Thank you for your inquiry about the upcoming tax filing deadline. I understand your concerns and want to provide you with clear information about your options.

**Deadline Extension Options:**
1. **Automatic Extension**: File Form 4868 by April 15 for a 6-month extension to October 15
2. **Payment Arrangements**: Set up payment plans if taxes are owed
3. **Professional Assistance**: I can help expedite your return preparation

**Next Steps:**
- Let's schedule a consultation to review your specific situation
- I'll help determine the best approach for your circumstances
- We can discuss any documentation you still need to gather

Please reply with your preferred meeting times, and I'll accommodate your schedule.

Best regards,
[Your Name]`

            emailMetadata = {
                subject: 'Important Information About Tax Filing Deadlines',
                recipients: ['client@example.com']
            }
        } else if (lowerPrompt.includes('welcome') || lowerPrompt.includes('new client')) {
            aiResponseContent = `Here's a warm welcome email for new clients:

**Subject: Welcome to [Company Name] - Your Tax Service Journey Begins**

Dear [Client Name],

Welcome to [Company Name]! I'm delighted to have you as a new client and look forward to providing you with exceptional tax services.

**What to Expect:**
- Personalized attention to your unique tax situation
- Proactive communication throughout the process
- Expert guidance on tax optimization strategies
- Secure document handling and confidentiality

**Getting Started:**
1. I'll send you a secure client portal invitation
2. You can upload documents through our encrypted system
3. We'll schedule an initial consultation to discuss your needs

**Questions?**
Please don't hesitate to reach out with any questions. I'm here to make your tax experience as smooth as possible.

Welcome aboard!

Best regards,
[Your Name]`

            emailMetadata = {
                subject: 'Welcome to [Company Name] - Your Tax Service Journey Begins',
                recipients: ['newclient@example.com']
            }
        } else {
            aiResponseContent = `I understand you need help with: "${prompt}"

As your Email Agent, I can assist you with composing:
- Professional client communications
- Follow-up emails and reminders
- Welcome messages for new clients
- Deadline notifications and extensions
- Response emails to client inquiries
- Meeting scheduling and confirmations

To provide you with the most effective email content, could you please specify:
1. The type of email you need (response, follow-up, notification, etc.)
2. The main purpose or message you want to convey
3. Any specific tone you'd prefer (formal, friendly, urgent, etc.)
4. Key information that should be included

I'll then craft a professional email template tailored to your needs.`

            emailMetadata = {
                subject: 'Email Composition Assistance',
                recipients: []
            }
        }

        const aiMessage = {
            id: `email-msg-ai-${Date.now()}`,
            user: user,
            session: params.sessionId,
            role: 'assistant',
            content: aiResponseContent,
            created_at: new Date(Date.now() + 1000).toISOString(),
            email_metadata: emailMetadata
        }

        return NextResponse.json({
            user_message: userMessage,
            ai_message: aiMessage
        })
    } catch (error) {
        console.error('Error processing email agent message:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
