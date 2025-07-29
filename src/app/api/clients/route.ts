import { NextRequest, NextResponse } from 'next/server'

// Interface for client data
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

interface ClientListResponse {
    clients: Client[]
    total: number
    page: number
    page_size: number
    total_pages: number
}

interface CreateClientRequest {
    name: string
    status: 'active' | 'inactive'
    entity_type: 'individual' | 'corporation' | 'partnership' | 'llc' | 'nonprofit' | 'trust'
    workspace: string
    email?: string
    phone?: string
    address?: string
    tax_id?: string
    notes?: string
}

// Mock data for demonstration
const generateMockClients = (count: number, workspaceId: string): Client[] => {
    const names = [
        'John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis', 'David Wilson',
        'Lisa Anderson', 'Robert Taylor', 'Jessica Thomas', 'Christopher Jackson', 'Amanda White',
        'Matthew Harris', 'Ashley Martin', 'Joshua Thompson', 'Jennifer Garcia', 'Andrew Martinez',
        'Stephanie Robinson', 'Daniel Clark', 'Michelle Rodriguez', 'James Lewis', 'Nicole Walker',
        'Acme Corporation', 'TechStart LLC', 'Global Enterprises Inc', 'Smith & Associates',
        'Innovation Partners', 'Future Dynamics LLC', 'Progressive Solutions Inc', 'Elite Consulting',
        'Strategic Ventures', 'Premier Holdings'
    ]

    const entityTypes: Client['entity_type'][] = ['individual', 'corporation', 'partnership', 'llc', 'nonprofit', 'trust']
    const statuses: Client['status'][] = ['active', 'inactive']

    return Array.from({ length: count }, (_, index) => {
        const isCompany = index >= 20
        const entityType = isCompany 
            ? entityTypes[Math.floor(Math.random() * (entityTypes.length - 1)) + 1] 
            : 'individual'
        
        const name = names[index % names.length]
        const id = `client_${(index + 1).toString().padStart(3, '0')}`
        
        const createdDate = new Date()
        createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 365))
        
        return {
            id,
            name,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            entity_type: entityType,
            document_count: Math.floor(Math.random() * 20),
            workspace: workspaceId,
            metadata: {
                email: isCompany ? `contact@${name.toLowerCase().replace(/\s+/g, '')}.com` : `${name.toLowerCase().replace(/\s+/g, '.')}@email.com`,
                phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
                address: `${Math.floor(Math.random() * 9999) + 1} ${['Main St', 'Oak Ave', 'Pine Rd', 'First St', 'Second Ave'][Math.floor(Math.random() * 5)]}, ${['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random() * 5)]}, ${['NY', 'CA', 'IL', 'TX', 'AZ'][Math.floor(Math.random() * 5)]} ${Math.floor(Math.random() * 90000) + 10000}`,
                tax_id: entityType === 'individual' 
                    ? `${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 9000) + 1000}`
                    : `${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 9000000) + 1000000}`,
                notes: Math.random() > 0.5 ? `Additional notes for ${name}` : '',
                created_date: createdDate.toISOString(),
                last_updated: new Date().toISOString()
            }
        }
    })
}

let mockClients: Client[] = []

// Initialize mock data
const initializeMockData = (workspaceId: string) => {
    if (mockClients.length === 0) {
        mockClients = generateMockClients(50, workspaceId)
    }
}

// Filter and sort clients
const filterAndSortClients = (
    clients: Client[],
    filters: {
        search?: string
        status?: string
        entity_type?: string
        workspace: string
    },
    sort: {
        field: string
        direction: 'asc' | 'desc'
    }
): Client[] => {
    let filtered = clients.filter(client => {
        if (client.workspace !== filters.workspace) return false
        
        if (filters.search) {
            const searchLower = filters.search.toLowerCase()
            if (!client.name.toLowerCase().includes(searchLower) &&
                !client.id.toLowerCase().includes(searchLower) &&
                !(client.metadata.email?.toLowerCase().includes(searchLower))) {
                return false
            }
        }
        
        if (filters.status && filters.status !== 'all' && client.status !== filters.status) {
            return false
        }
        
        if (filters.entity_type && filters.entity_type !== 'all' && client.entity_type !== filters.entity_type) {
            return false
        }
        
        return true
    })

    // Sort clients
    filtered.sort((a, b) => {
        let aValue: any
        let bValue: any

        switch (sort.field) {
            case 'name':
                aValue = a.name.toLowerCase()
                bValue = b.name.toLowerCase()
                break
            case 'status':
                aValue = a.status
                bValue = b.status
                break
            case 'entity_type':
                aValue = a.entity_type
                bValue = b.entity_type
                break
            case 'document_count':
                aValue = a.document_count
                bValue = b.document_count
                break
            case 'created_date':
                aValue = new Date(a.metadata.created_date).getTime()
                bValue = new Date(b.metadata.created_date).getTime()
                break
            default:
                aValue = a.name.toLowerCase()
                bValue = b.name.toLowerCase()
        }

        if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1
        return 0
    })

    return filtered
}

// Generate client ID
const generateClientId = (): string => {
    const maxId = mockClients.reduce((max, client) => {
        const idNum = parseInt(client.id.replace('client_', ''))
        return Math.max(max, idNum)
    }, 0)
    return `client_${(maxId + 1).toString().padStart(3, '0')}`
}

// GET handler - list clients with filtering, sorting, and pagination
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        
        const workspace = searchParams.get('workspace')
        if (!workspace) {
            return NextResponse.json(
                { error: 'workspace parameter is required' },
                { status: 400 }
            )
        }

        // Initialize mock data for this workspace
        initializeMockData(workspace)

        const page = parseInt(searchParams.get('page') || '1')
        const pageSize = parseInt(searchParams.get('page_size') || '20')
        const search = searchParams.get('search') || ''
        const status = searchParams.get('status') || 'all'
        const entityType = searchParams.get('entity_type') || 'all'
        const sortField = searchParams.get('sort') || 'name'
        const sortDirection = (searchParams.get('direction') || 'asc') as 'asc' | 'desc'

        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 300))

        // Filter and sort clients
        const filteredClients = filterAndSortClients(
            mockClients,
            { search, status, entity_type: entityType, workspace },
            { field: sortField, direction: sortDirection }
        )

        // Apply pagination
        const startIndex = (page - 1) * pageSize
        const endIndex = startIndex + pageSize
        const paginatedClients = filteredClients.slice(startIndex, endIndex)

        const response: ClientListResponse = {
            clients: paginatedClients,
            total: filteredClients.length,
            page,
            page_size: pageSize,
            total_pages: Math.ceil(filteredClients.length / pageSize)
        }

        return NextResponse.json(response, { status: 200 })

    } catch (error) {
        console.error('Error fetching clients:', error)
        
        return NextResponse.json(
            { 
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}

// POST handler - create new client
export async function POST(request: NextRequest) {
    try {
        const body: CreateClientRequest = await request.json()

        // Validate required fields
        if (!body.name || !body.workspace) {
            return NextResponse.json(
                { error: 'name and workspace are required' },
                { status: 400 }
            )
        }

        // Initialize mock data for this workspace
        initializeMockData(body.workspace)

        // Check if client with same name already exists in workspace
        const existingClient = mockClients.find(
            client => client.workspace === body.workspace && 
                     client.name.toLowerCase() === body.name.toLowerCase()
        )

        if (existingClient) {
            return NextResponse.json(
                { error: 'A client with this name already exists in the workspace' },
                { status: 409 }
            )
        }

        // Create new client
        const now = new Date().toISOString()
        const newClient: Client = {
            id: generateClientId(),
            name: body.name,
            status: body.status || 'active',
            entity_type: body.entity_type || 'individual',
            document_count: 0,
            workspace: body.workspace,
            metadata: {
                email: body.email || '',
                phone: body.phone || '',
                address: body.address || '',
                tax_id: body.tax_id || '',
                notes: body.notes || '',
                created_date: now,
                last_updated: now
            }
        }

        // Add to mock storage
        mockClients.push(newClient)

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 200))

        console.log(`Created new client: ${newClient.name} (${newClient.id}) in workspace ${newClient.workspace}`)

        return NextResponse.json(newClient, { status: 201 })

    } catch (error) {
        console.error('Error creating client:', error)
        
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

// Handle unsupported methods
export async function PUT() {
    return NextResponse.json(
        { error: 'Method not allowed. Use /api/clients/{clientId}/ for updates' },
        { status: 405 }
    )
}

export async function DELETE() {
    return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
    )
}
