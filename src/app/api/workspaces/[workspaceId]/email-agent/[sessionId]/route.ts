import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserServer } from '@/lib/session'

export async function GET(request: NextRequest, { params }: { params: { workspaceId: string; sessionId: string } }) {
    try {
        const user = await getCurrentUserServer()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Mock session data - in production, fetch from backend
        const mockSession = {
            id: params.sessionId,
            user: user,
            workspace: { id: params.workspaceId },
            name: 'Client Response - Tax Questions',
            status: 'active',
            client_id: 'client-1',
            client_name: 'John Smith',
            email_subject: 'Re: Tax Filing Questions',
            email_type: 'response',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            total_messages: 2,
            messages: [
                {
                    id: 'email-msg-1',
                    user: user,
                    session: params.sessionId,
                    role: 'user',
                    content:
                        'I need to write a response to a client who asked about deadline extensions for their tax filing. They seem worried about missing the April deadline.',
                    created_at: new Date(Date.now() - 300000).toISOString(),
                },
                {
                    id: 'email-msg-2',
                    user: user,
                    session: params.sessionId,
                    role: 'assistant',
                    content:
                        "Here's a professional and reassuring response to your client:\n\n**Subject: Re: Tax Filing Questions - Extension Options Available**\n\nDear John,\n\nThank you for reaching out about the tax filing deadline. I understand your concerns, and I'm here to help ensure you have all the information you need.\n\nRegarding deadline extensions, you have several options:\n\n1. **Automatic Extension**: You can file Form 4868 to get an automatic 6-month extension until October 15, 2025. This extends the time to file your return, but any taxes owed are still due by April 15.\n\n2. **Payment Options**: If you owe taxes, you can set up a payment plan with the IRS to avoid penalties.\n\n3. **Current Status**: We still have time to prepare your return properly before the April deadline if you can provide the remaining documents by [specific date].\n\nI recommend we schedule a call this week to review your situation and determine the best path forward. Please let me know your availability.\n\nBest regards,\n[Your Name]\n\nWould you like me to adjust the tone or add any specific details?",
                    created_at: new Date(Date.now() - 240000).toISOString(),
                    email_metadata: {
                        subject: 'Re: Tax Filing Questions - Extension Options Available',
                        recipients: ['john.smith@email.com'],
                    },
                },
            ],
        }

        return NextResponse.json(mockSession)
    } catch (error) {
        console.error('Error fetching email agent session:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
