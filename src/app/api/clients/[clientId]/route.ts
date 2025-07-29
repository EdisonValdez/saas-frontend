import { NextRequest, NextResponse } from 'next/server'

// Interface for client data (same as main clients route)
interface Client {
    id: string
    name: string
    status: 'active' | 'inactive'
    entity_type: 'individual' | 'corporation' | 'partnership' | 'llc' | 'nonprofit' | 'trust'
    document_count: number
    workspace: string
    metadata: {
        email?: string
        phone?: string
        address?: string
        tax_id?: string
        notes?: string
        created_date: string
        last_updated: string
    }
}

interface UpdateClientRequest {
    name?: string
    status?: 'active' | 'inactive'
    entity_type?: 'individual' | 'corporation' | 'partnership' | 'llc' | 'nonprofit' | 'trust'
    email?: string
    phone?: string
    address?: string
    tax_id?: string
    notes?: string
}

// Mock storage - in a real app, this would be a database
// We'll simulate getting data from the same storage as the main clients route
const getMockClients = (): Client[] => {
    // This would normally fetch from your database
    // For demo purposes, we'll return some sample data
    return [
        {
            id: 'client_001',
            name: 'John Smith',
            status: 'active',
            entity_type: 'individual',
            document_count: 5,
            workspace: 'demo-workspace-123',
            metadata: {
                email: 'john.smith@email.com',
                phone: '(555) 123-4567',
                address: '123 Main St, New York, NY 10001',
                tax_id: '123-45-6789',
                notes: 'Regular client, files annually',
                created_date: '2023-01-15T10:30:00Z',
                last_updated: '2024-01-15T14:20:00Z'
            }
        },
        {
            id: 'client_002',
            name: 'Acme Corporation',
            status: 'active',
            entity_type: 'corporation',
            document_count: 12,
            workspace: 'demo-workspace-123',
            metadata: {
                email: 'contact@acmecorp.com',
                phone: '(555) 987-6543',
                address: '456 Business Ave, Los Angeles, CA 90210',
                tax_id: '12-3456789',
                notes: 'Large corporate client, quarterly filings',
                created_date: '2023-03-20T09:15:00Z',
                last_updated: '2024-01-10T16:45:00Z'
            }
        }
    ]
}

// Find client by ID
const findClientById = (clientId: string): Client | null => {
    const clients = getMockClients()
    return clients.find(client => client.id === clientId) || null
}

// Update client in mock storage
const updateClientInStorage = (clientId: string, updates: Partial<Client>): Client | null => {
    // In a real app, this would update the database
    // For demo purposes, we'll just return the updated client
    const client = findClientById(clientId)
    if (!client) return null

    const updatedClient: Client = {
        ...client,
        ...updates,
        metadata: {
            ...client.metadata,
            ...(updates.metadata || {}),
            last_updated: new Date().toISOString()
        }
    }

    console.log(`Updated client ${clientId}:`, updatedClient)
    return updatedClient
}

// GET handler - retrieve specific client details
export async function GET(
    request: NextRequest,
    { params }: { params: { clientId: string } }
) {
    try {
        const { clientId } = params

        if (!clientId) {
            return NextResponse.json(
                { error: 'Client ID is required' },
                { status: 400 }
            )
        }

        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 200))

        // Find client
        const client = findClientById(clientId)

        if (!client) {
            return NextResponse.json(
                { error: 'Client not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(client, { status: 200 })

    } catch (error) {
        console.error('Error retrieving client:', error)
        
        return NextResponse.json(
            { 
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}

// PUT handler - update client details
export async function PUT(
    request: NextRequest,
    { params }: { params: { clientId: string } }
) {
    try {
        const { clientId } = params

        if (!clientId) {
            return NextResponse.json(
                { error: 'Client ID is required' },
                { status: 400 }
            )
        }

        // Parse request body
        const body: UpdateClientRequest = await request.json()

        // Find existing client
        const existingClient = findClientById(clientId)
        if (!existingClient) {
            return NextResponse.json(
                { error: 'Client not found' },
                { status: 404 }
            )
        }

        // Validate update data
        if (body.name && body.name.trim().length === 0) {
            return NextResponse.json(
                { error: 'Client name cannot be empty' },
                { status: 400 }
            )
        }

        // Check for duplicate names in workspace (if name is being updated)
        if (body.name && body.name !== existingClient.name) {
            const clients = getMockClients()
            const duplicateClient = clients.find(
                client => client.workspace === existingClient.workspace && 
                         client.id !== clientId &&
                         client.name.toLowerCase() === body.name.toLowerCase()
            )

            if (duplicateClient) {
                return NextResponse.json(
                    { error: 'A client with this name already exists in the workspace' },
                    { status: 409 }
                )
            }
        }

        // Prepare updates
        const clientUpdates: Partial<Client> = {}
        const metadataUpdates: Partial<Client['metadata']> = {}

        // Update main fields
        if (body.name !== undefined) clientUpdates.name = body.name
        if (body.status !== undefined) clientUpdates.status = body.status
        if (body.entity_type !== undefined) clientUpdates.entity_type = body.entity_type

        // Update metadata fields
        if (body.email !== undefined) metadataUpdates.email = body.email
        if (body.phone !== undefined) metadataUpdates.phone = body.phone
        if (body.address !== undefined) metadataUpdates.address = body.address
        if (body.tax_id !== undefined) metadataUpdates.tax_id = body.tax_id
        if (body.notes !== undefined) metadataUpdates.notes = body.notes

        if (Object.keys(metadataUpdates).length > 0) {
            clientUpdates.metadata = metadataUpdates
        }

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 300))

        // Update client
        const updatedClient = updateClientInStorage(clientId, clientUpdates)

        if (!updatedClient) {
            return NextResponse.json(
                { error: 'Failed to update client' },
                { status: 500 }
            )
        }

        return NextResponse.json(updatedClient, { status: 200 })

    } catch (error) {
        console.error('Error updating client:', error)
        
        if (error instanceof SyntaxError) {
            return NextResponse.json(
                { error: 'Invalid JSON in request body' },
                { status: 400 }
            )
        }
        
        return NextResponse.json(
            { 
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}

// DELETE handler - delete client (soft delete or archive)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { clientId: string } }
) {
    try {
        const { clientId } = params

        if (!clientId) {
            return NextResponse.json(
                { error: 'Client ID is required' },
                { status: 400 }
            )
        }

        // Find existing client
        const existingClient = findClientById(clientId)
        if (!existingClient) {
            return NextResponse.json(
                { error: 'Client not found' },
                { status: 404 }
            )
        }

        // Check if client has documents
        if (existingClient.document_count > 0) {
            return NextResponse.json(
                { 
                    error: 'Cannot delete client with existing documents. Consider setting status to inactive instead.',
                    details: `Client has ${existingClient.document_count} associated documents`
                },
                { status: 409 }
            )
        }

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 200))

        // In a real app, you would either:
        // 1. Soft delete (set a deleted flag)
        // 2. Move to archive table
        // 3. Hard delete if appropriate

        console.log(`Deleted client ${clientId}: ${existingClient.name}`)

        return NextResponse.json(
            { message: 'Client deleted successfully' },
            { status: 200 }
        )

    } catch (error) {
        console.error('Error deleting client:', error)
        
        return NextResponse.json(
            { 
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}

// Handle unsupported methods
export async function POST() {
    return NextResponse.json(
        { error: 'Method not allowed. Use /api/clients/ for creating new clients' },
        { status: 405 }
    )
}
