import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserServer } from '@/lib/session'

export async function POST(request: NextRequest, { params }: { params: { workspaceId: string; sessionId: string } }) {
    try {
        const user = await getCurrentUserServer()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { prompt, clientId, agentType } = body

        if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
            return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
        }

        // Mock AI response generation - in production, this would call your AI service
        const userMessage = {
            id: `msg-user-${Date.now()}`,
            user: user,
            session: params.sessionId,
            role: 'user',
            content: prompt.trim(),
            created_at: new Date().toISOString(),
        }

        // Generate a contextual AI response based on the prompt
        let aiResponseContent = ''
        const lowerPrompt = prompt.toLowerCase()

        if (lowerPrompt.includes('deduction')) {
            aiResponseContent = `Based on your question about deductions, here are some key points to consider:

1. **Business Expenses**: If you're self-employed or have business income, you can deduct ordinary and necessary business expenses.

2. **Home Office Deduction**: If you use part of your home exclusively for business, you may qualify for the home office deduction.

3. **Education Expenses**: Costs for education that maintains or improves job skills may be deductible.

4. **Charitable Contributions**: Donations to qualified organizations are deductible if you itemize.

Would you like me to provide more specific information about any of these deduction categories?`
        } else if (lowerPrompt.includes('form') || lowerPrompt.includes('filing')) {
            aiResponseContent = `Regarding tax forms and filing:

1. **Form 1040**: The main individual income tax return form
2. **Filing Deadlines**: April 15, 2025 for 2024 tax returns (unless extended)
3. **Electronic Filing**: IRS e-file is the most accurate and fastest way to file
4. **Required Documents**: W-2s, 1099s, receipts for deductions

Do you need help with any specific form or filing requirement?`
        } else {
            aiResponseContent = `I understand you're asking about: "${prompt}"

As your AI Tax Assistant, I can help you with:
- Tax deductions and credits
- Filing requirements and deadlines
- Form selection and preparation
- Tax planning strategies
- IRS regulations and updates

Could you provide more specific details about what aspect of taxes you'd like assistance with? If this relates to a specific client, I can tailor my advice accordingly.`
        }

        const aiMessage = {
            id: `msg-ai-${Date.now()}`,
            user: user, // AI messages also have the user context
            session: params.sessionId,
            role: 'assistant',
            content: aiResponseContent,
            created_at: new Date(Date.now() + 1000).toISOString(), // Slight delay to show proper ordering
        }

        return NextResponse.json({
            user_message: userMessage,
            ai_message: aiMessage,
        })
    } catch (error) {
        console.error('Error processing tax assistant message:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
