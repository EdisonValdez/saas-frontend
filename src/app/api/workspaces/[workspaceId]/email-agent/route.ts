import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserServer } from '@/lib/session'

export async function GET(request: NextRequest, { params }: { params: { workspaceId: string } }) {
    try {
        const user = await getCurrentUserServer()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Mock email agent sessions - in production, fetch from backend
        const mockSessions = [
            {
                id: 'email-session-1',
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
                total_messages: 3,
                messages: [],
            },
            {
                id: 'email-session-2',
                user: user,
                workspace: { id: params.workspaceId },
                name: 'Follow-up on Document Submission',
                status: 'completed',
                client_id: 'client-2',
                client_name: 'ABC Corp',
                email_subject: 'Document Submission Follow-up',
                email_type: 'follow_up',
                created_at: new Date(Date.now() - 86400000).toISOString(),
                updated_at: new Date(Date.now() - 86400000).toISOString(),
                total_messages: 8,
                messages: [],
            },
            {
                id: 'email-session-3',
                user: user,
                workspace: { id: params.workspaceId },
                name: 'New Client Welcome Email',
                status: 'archived',
                client_id: null,
                client_name: null,
                email_subject: 'Welcome to Our Tax Services',
                email_type: 'draft',
                created_at: new Date(Date.now() - 172800000).toISOString(),
                updated_at: new Date(Date.now() - 172800000).toISOString(),
                total_messages: 6,
                messages: [],
            },
        ]

        return NextResponse.json(mockSessions)
    } catch (error) {
        console.error('Error fetching email agent sessions:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest, { params }: { params: { workspaceId: string } }) {
    try {
        const user = await getCurrentUserServer()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { name, client_id, client_name, email_subject, email_type = 'draft' } = body

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return NextResponse.json({ error: 'Session name is required' }, { status: 400 })
        }

        // Validate email_type
        const validEmailTypes = ['draft', 'response', 'follow_up', 'notification']
        if (!validEmailTypes.includes(email_type)) {
            return NextResponse.json({ error: 'Invalid email type' }, { status: 400 })
        }

        // Mock session creation - in production, this would create in your backend
        const newSession = {
            id: `email-session-${Date.now()}`,
            user: user,
            workspace: { id: params.workspaceId },
            name: name.trim(),
            status: 'active',
            client_id: client_id || null,
            client_name: client_name || null,
            email_subject: email_subject?.trim() || null,
            email_type: email_type,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            total_messages: 0,
            messages: [],
        }

        return NextResponse.json(newSession, { status: 201 })
    } catch (error) {
        console.error('Error creating email agent session:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
