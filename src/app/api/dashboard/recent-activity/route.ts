import { NextRequest, NextResponse } from 'next/server'

// Interface for recent activity
interface RecentActivity {
    id: string
    type: 'document_uploaded' | 'extraction_completed' | 'client_added' | 'form_processed' | 'validation_error'
    title: string
    description: string
    timestamp: string
    client_name?: string
    document_type?: string
    status: 'success' | 'warning' | 'error' | 'info'
}

interface RecentActivityResponse {
    activities: RecentActivity[]
    total: number
}

// Generate mock recent activity data
const generateMockActivities = (workspaceId: string): RecentActivity[] => {
    const clientNames = [
        'John Smith', 'Sarah Johnson', 'Acme Corporation', 'TechStart LLC',
        'Emily Davis', 'Michael Brown', 'Global Enterprises', 'Innovation Partners',
        'David Wilson', 'Lisa Anderson', 'Future Dynamics', 'Elite Consulting'
    ]

    const documentTypes = ['W-2', '1099-MISC', 'W-4', '1040', 'Schedule C', '1099-NEC']

    const activityTemplates = [
        {
            type: 'document_uploaded' as const,
            title: 'Document uploaded',
            description: 'New {documentType} form uploaded for {clientName}',
            status: 'info' as const
        },
        {
            type: 'extraction_completed' as const,
            title: 'Extraction completed',
            description: 'Successfully extracted data from {documentType} for {clientName}',
            status: 'success' as const
        },
        {
            type: 'client_added' as const,
            title: 'New client added',
            description: 'Client {clientName} was added to the system',
            status: 'info' as const
        },
        {
            type: 'form_processed' as const,
            title: 'Form processed',
            description: '{documentType} form processing completed for {clientName}',
            status: 'success' as const
        },
        {
            type: 'validation_error' as const,
            title: 'Validation error',
            description: 'Validation issues found in {documentType} for {clientName}',
            status: 'error' as const
        }
    ]

    // Generate activities for the last 7 days
    const activities: RecentActivity[] = []
    const now = new Date()
    
    // Determine number of activities based on workspace type
    const activityCount = workspaceId.includes('small') ? 15 : 
                         workspaceId.includes('corporate') ? 35 : 25

    for (let i = 0; i < activityCount; i++) {
        const template = activityTemplates[Math.floor(Math.random() * activityTemplates.length)]
        const clientName = clientNames[Math.floor(Math.random() * clientNames.length)]
        const documentType = documentTypes[Math.floor(Math.random() * documentTypes.length)]
        
        // Generate timestamp within last 7 days
        const daysAgo = Math.floor(Math.random() * 7)
        const hoursAgo = Math.floor(Math.random() * 24)
        const minutesAgo = Math.floor(Math.random() * 60)
        
        const timestamp = new Date(now)
        timestamp.setDate(timestamp.getDate() - daysAgo)
        timestamp.setHours(timestamp.getHours() - hoursAgo)
        timestamp.setMinutes(timestamp.getMinutes() - minutesAgo)

        const activity: RecentActivity = {
            id: `activity_${i + 1}_${Date.now()}`,
            type: template.type,
            title: template.title,
            description: template.description
                .replace('{clientName}', clientName)
                .replace('{documentType}', documentType),
            timestamp: timestamp.toISOString(),
            client_name: clientName,
            document_type: template.type !== 'client_added' ? documentType : undefined,
            status: template.status
        }

        activities.push(activity)
    }

    // Sort by timestamp (newest first)
    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

// GET handler - retrieve recent activity
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const workspace = searchParams.get('workspace')
        const limit = parseInt(searchParams.get('limit') || '20')

        if (!workspace) {
            return NextResponse.json(
                { error: 'workspace parameter is required' },
                { status: 400 }
            )
        }

        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 400))

        // Generate mock activity data
        const allActivities = generateMockActivities(workspace)
        const activities = allActivities.slice(0, limit)

        const response: RecentActivityResponse = {
            activities,
            total: allActivities.length
        }

        console.log(`Generated ${activities.length} recent activities for workspace: ${workspace}`)

        return NextResponse.json(response, { status: 200 })

    } catch (error) {
        console.error('Error generating recent activity:', error)
        
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
        { error: 'Method not allowed' },
        { status: 405 }
    )
}

export async function PUT() {
    return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
    )
}

export async function DELETE() {
    return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
    )
}
