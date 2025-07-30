import { NextRequest, NextResponse } from 'next/server'

// Interface for dashboard metrics
interface DashboardMetrics {
    total_documents: number
    processed_forms: number
    pending_tasks: number
    active_clients: number
    documents_today: number
    processing_accuracy: number
    avg_processing_time: number
    completed_today: number
    trends: {
        documents: number // percentage change
        processing: number
        clients: number
    }
}

interface ChartData {
    form_types: Array<{
        name: string
        count: number
        percentage: number
        color: string
    }>
    processing_status: Array<{
        name: string
        count: number
        color: string
    }>
    weekly_activity: Array<{
        day: string
        documents: number
        processed: number
        errors: number
    }>
}

interface DashboardMetricsResponse {
    metrics: DashboardMetrics
    charts: ChartData
}

// Generate mock metrics data
const generateMockMetrics = (workspaceId: string): DashboardMetrics => {
    // Simulate different metrics based on workspace ID
    const baseMultiplier = workspaceId.includes('small') ? 0.3 : 
                          workspaceId.includes('corporate') ? 1.5 : 1.0

    return {
        total_documents: Math.floor(1250 * baseMultiplier),
        processed_forms: Math.floor(980 * baseMultiplier),
        pending_tasks: Math.floor(45 * baseMultiplier),
        active_clients: Math.floor(125 * baseMultiplier),
        documents_today: Math.floor(23 * baseMultiplier),
        processing_accuracy: 94.7,
        avg_processing_time: 3.2,
        completed_today: Math.floor(18 * baseMultiplier),
        trends: {
            documents: Math.floor(Math.random() * 20) - 5, // -5 to +15
            processing: Math.floor(Math.random() * 15), // 0 to +15
            clients: Math.floor(Math.random() * 10) - 2  // -2 to +8
        }
    }
}

// Generate mock chart data
const generateMockChartData = (workspaceId: string): ChartData => {
    const formTypes = [
        { name: 'W-2', count: 450, percentage: 32, color: '#3B82F6' },
        { name: '1099-MISC', count: 320, percentage: 23, color: '#10B981' },
        { name: 'W-4', count: 180, percentage: 13, color: '#F59E0B' },
        { name: '1040', count: 220, percentage: 16, color: '#EF4444' },
        { name: 'Schedule C', count: 150, percentage: 11, color: '#8B5CF6' },
        { name: 'Other', count: 80, percentage: 5, color: '#6B7280' }
    ]

    const processingStatus = [
        { name: 'Completed', count: 850, color: '#10B981' },
        { name: 'Processing', count: 180, color: '#3B82F6' },
        { name: 'Pending', count: 120, color: '#F59E0B' },
        { name: 'Error', count: 25, color: '#EF4444' }
    ]

    const weeklyActivity = [
        { day: 'Mon', documents: 45, processed: 38, errors: 2 },
        { day: 'Tue', documents: 52, processed: 47, errors: 1 },
        { day: 'Wed', documents: 38, processed: 35, errors: 3 },
        { day: 'Thu', documents: 61, processed: 55, errors: 2 },
        { day: 'Fri', documents: 48, processed: 43, errors: 1 },
        { day: 'Sat', documents: 23, processed: 21, errors: 0 },
        { day: 'Sun', documents: 15, processed: 14, errors: 1 }
    ]

    // Adjust data based on workspace type
    const multiplier = workspaceId.includes('small') ? 0.4 : 
                      workspaceId.includes('corporate') ? 1.6 : 1.0

    return {
        form_types: formTypes.map(item => ({
            ...item,
            count: Math.floor(item.count * multiplier)
        })),
        processing_status: processingStatus.map(item => ({
            ...item,
            count: Math.floor(item.count * multiplier)
        })),
        weekly_activity: weeklyActivity.map(item => ({
            ...item,
            documents: Math.floor(item.documents * multiplier),
            processed: Math.floor(item.processed * multiplier),
            errors: Math.max(0, Math.floor(item.errors * multiplier))
        }))
    }
}

// GET handler - retrieve dashboard metrics and chart data
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

        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 800))

        // Generate mock data
        const metrics = generateMockMetrics(workspace)
        const charts = generateMockChartData(workspace)

        const response: DashboardMetricsResponse = {
            metrics,
            charts
        }

        // Log for debugging (remove in production)
        console.log(`Generated dashboard metrics for workspace: ${workspace}`)

        return NextResponse.json(response, { status: 200 })

    } catch (error) {
        console.error('Error generating dashboard metrics:', error)
        
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
