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
            name: '2024 Tax Return Review',
            status: 'active',
            client_id: 'client-1',
            client_name: 'John Smith',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            total_messages: 2,
            messages: [
                {
                    id: 'msg-1',
                    user: user,
                    session: params.sessionId,
                    role: 'user',
                    content: 'What are the key deductions I should consider for my 2024 tax return?',
                    created_at: new Date(Date.now() - 300000).toISOString(),
                },
                {
                    id: 'msg-2',
                    user: user,
                    session: params.sessionId,
                    role: 'assistant',
                    content:
                        'For your 2024 tax return, here are the key deductions to consider:\n\n1. **Standard vs. Itemized Deductions**: The standard deduction for 2024 is $14,600 for single filers and $29,200 for married filing jointly.\n\n2. **Common Itemized Deductions**:\n   - State and local taxes (SALT) up to $10,000\n   - Mortgage interest on loans up to $750,000\n   - Charitable contributions\n   - Medical expenses exceeding 7.5% of AGI\n\n3. **Business Deductions** (if applicable):\n   - Home office expenses\n   - Business meals (50% deductible)\n   - Professional development and training\n\nWould you like me to elaborate on any of these categories or discuss your specific situation?',
                    created_at: new Date(Date.now() - 240000).toISOString(),
                },
            ],
        }

        return NextResponse.json(mockSession)
    } catch (error) {
        console.error('Error fetching tax assistant session:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
