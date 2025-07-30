import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserServer } from '@/lib/session'

export async function GET(
    request: NextRequest,
    { params }: { params: { workspaceId: string } }
) {
    try {
        const user = await getCurrentUserServer()
        
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Mock clients data - in production, this would fetch from your backend
        const mockClients = [
            {
                id: 'client-1',
                name: 'John Smith',
                email: 'john.smith@email.com',
                workspace_id: params.workspaceId,
                created_at: new Date().toISOString()
            },
            {
                id: 'client-2',
                name: 'ABC Corporation',
                email: 'contact@abccorp.com',
                workspace_id: params.workspaceId,
                created_at: new Date(Date.now() - 86400000).toISOString()
            },
            {
                id: 'client-3',
                name: 'Sarah Johnson',
                email: 'sarah.johnson@email.com',
                workspace_id: params.workspaceId,
                created_at: new Date(Date.now() - 172800000).toISOString()
            },
            {
                id: 'client-4',
                name: 'XYZ LLC',
                email: 'info@xyzllc.com',
                workspace_id: params.workspaceId,
                created_at: new Date(Date.now() - 259200000).toISOString()
            },
            {
                id: 'client-5',
                name: 'Michael Brown',
                email: 'michael.brown@email.com',
                workspace_id: params.workspaceId,
                created_at: new Date(Date.now() - 345600000).toISOString()
            }
        ]

        return NextResponse.json(mockClients)
    } catch (error) {
        console.error('Error fetching clients:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
