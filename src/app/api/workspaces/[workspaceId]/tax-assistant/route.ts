import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserServer } from '@/lib/session'
import { siteConfig } from '@/config/site'

export async function GET(
    request: NextRequest,
    { params }: { params: { workspaceId: string } }
) {
    try {
        const user = await getCurrentUserServer()
        
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // For now, return mock data. In production, this would fetch from your backend
        const mockSessions = [
            {
                id: 'tax-session-1',
                user: user,
                workspace: { id: params.workspaceId },
                name: '2024 Tax Return Review',
                status: 'active',
                client_id: 'client-1',
                client_name: 'John Smith',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                total_messages: 5,
                messages: []
            },
            {
                id: 'tax-session-2',
                user: user,
                workspace: { id: params.workspaceId },
                name: 'Business Deductions Consultation',
                status: 'completed',
                client_id: 'client-2',
                client_name: 'ABC Corp',
                created_at: new Date(Date.now() - 86400000).toISOString(),
                updated_at: new Date(Date.now() - 86400000).toISOString(),
                total_messages: 12,
                messages: []
            }
        ]

        return NextResponse.json(mockSessions)
    } catch (error) {
        console.error('Error fetching tax assistant sessions:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { workspaceId: string } }
) {
    try {
        const user = await getCurrentUserServer()
        
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { name, client_id, client_name } = body

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return NextResponse.json(
                { error: 'Session name is required' },
                { status: 400 }
            )
        }

        // Mock session creation - in production, this would create in your backend
        const newSession = {
            id: `tax-session-${Date.now()}`,
            user: user,
            workspace: { id: params.workspaceId },
            name: name.trim(),
            status: 'active',
            client_id: client_id || null,
            client_name: client_name || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            total_messages: 0,
            messages: []
        }

        return NextResponse.json(newSession, { status: 201 })
    } catch (error) {
        console.error('Error creating tax assistant session:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
