import { NextRequest, NextResponse } from 'next/server'

// Interface for dashboard alerts
interface DashboardAlert {
    id: string
    type: 'error' | 'warning' | 'info'
    title: string
    description: string
    count: number
    action_required: boolean
    priority: 'high' | 'medium' | 'low'
    created_at: string
}

interface DashboardAlertsResponse {
    alerts: DashboardAlert[]
    total: number
    high_priority_count: number
    action_required_count: number
}

// Generate mock alerts data
const generateMockAlerts = (workspaceId: string): DashboardAlert[] => {
    const now = new Date()
    const alerts: DashboardAlert[] = []

    // Alert templates based on common tax processing scenarios
    const alertTemplates = [
        {
            type: 'error' as const,
            title: 'Validation Failures',
            description: 'Multiple documents failed validation due to incorrect format or missing required fields',
            priority: 'high' as const,
            action_required: true,
            count_range: [3, 8]
        },
        {
            type: 'warning' as const,
            title: 'Low Confidence Extractions',
            description: 'Several document extractions have confidence scores below recommended threshold',
            priority: 'medium' as const,
            action_required: true,
            count_range: [5, 12]
        },
        {
            type: 'error' as const,
            title: 'Processing Queue Backlog',
            description: 'Document processing queue has been backed up for more than 2 hours',
            priority: 'high' as const,
            action_required: true,
            count_range: [1, 1]
        },
        {
            type: 'warning' as const,
            title: 'Duplicate Documents Detected',
            description: 'System has identified potential duplicate documents that may need review',
            priority: 'medium' as const,
            action_required: false,
            count_range: [2, 6]
        },
        {
            type: 'info' as const,
            title: 'Client Tax ID Verification',
            description: 'Some client tax IDs require manual verification for compliance',
            priority: 'medium' as const,
            action_required: true,
            count_range: [1, 4]
        },
        {
            type: 'warning' as const,
            title: 'Storage Space Warning',
            description: 'Document storage is approaching 80% capacity',
            priority: 'medium' as const,
            action_required: false,
            count_range: [1, 1]
        },
        {
            type: 'error' as const,
            title: 'API Rate Limit Exceeded',
            description: 'External tax calculation API rate limit has been exceeded',
            priority: 'high' as const,
            action_required: true,
            count_range: [1, 1]
        },
        {
            type: 'info' as const,
            title: 'Scheduled Maintenance',
            description: 'System maintenance is scheduled for this weekend',
            priority: 'low' as const,
            action_required: false,
            count_range: [1, 1]
        },
        {
            type: 'warning' as const,
            title: 'Unsigned Documents',
            description: 'Several processed documents are awaiting client digital signatures',
            priority: 'medium' as const,
            action_required: true,
            count_range: [3, 9]
        },
        {
            type: 'error' as const,
            title: 'Failed Document Downloads',
            description: 'Some documents could not be downloaded from client portals',
            priority: 'high' as const,
            action_required: true,
            count_range: [1, 3]
        }
    ]

    // Determine alert count based on workspace type
    const shouldGenerateAlert = () => {
        if (workspaceId.includes('demo-workspace-123')) {
            return Math.random() > 0.3 // 70% chance of generating alerts
        } else if (workspaceId.includes('small')) {
            return Math.random() > 0.6 // 40% chance
        } else if (workspaceId.includes('corporate')) {
            return Math.random() > 0.2 // 80% chance
        }
        return Math.random() > 0.4 // 60% chance default
    }

    // Generate alerts
    alertTemplates.forEach((template, index) => {
        if (shouldGenerateAlert()) {
            const count = Math.floor(
                Math.random() * (template.count_range[1] - template.count_range[0] + 1)
            ) + template.count_range[0]

            // Generate creation time (within last 24 hours for most alerts)
            const hoursAgo = Math.floor(Math.random() * 24)
            const minutesAgo = Math.floor(Math.random() * 60)
            const createdAt = new Date(now)
            createdAt.setHours(createdAt.getHours() - hoursAgo)
            createdAt.setMinutes(createdAt.getMinutes() - minutesAgo)

            alerts.push({
                id: `alert_${index + 1}_${Date.now()}`,
                type: template.type,
                title: template.title,
                description: template.description,
                count,
                action_required: template.action_required,
                priority: template.priority,
                created_at: createdAt.toISOString()
            })
        }
    })

    // Sort by priority (high first) then by creation time (newest first)
    return alerts.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[b.priority] - priorityOrder[a.priority]
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
}

// GET handler - retrieve dashboard alerts
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const workspace = searchParams.get('workspace')
        const priority = searchParams.get('priority') // optional filter
        const type = searchParams.get('type') // optional filter
        const limit = parseInt(searchParams.get('limit') || '10')

        if (!workspace) {
            return NextResponse.json(
                { error: 'workspace parameter is required' },
                { status: 400 }
            )
        }

        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 300))

        // Generate mock alerts
        let alerts = generateMockAlerts(workspace)

        // Apply filters if provided
        if (priority) {
            alerts = alerts.filter(alert => alert.priority === priority)
        }

        if (type) {
            alerts = alerts.filter(alert => alert.type === type)
        }

        // Apply limit
        const limitedAlerts = alerts.slice(0, limit)

        // Calculate summary statistics
        const highPriorityCount = alerts.filter(alert => alert.priority === 'high').length
        const actionRequiredCount = alerts.filter(alert => alert.action_required).length

        const response: DashboardAlertsResponse = {
            alerts: limitedAlerts,
            total: alerts.length,
            high_priority_count: highPriorityCount,
            action_required_count: actionRequiredCount
        }

        console.log(`Generated ${limitedAlerts.length} alerts for workspace: ${workspace}`)
        console.log(`High priority: ${highPriorityCount}, Action required: ${actionRequiredCount}`)

        return NextResponse.json(response, { status: 200 })

    } catch (error) {
        console.error('Error generating dashboard alerts:', error)
        
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
