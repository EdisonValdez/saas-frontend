import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: { workspaceId: string } }) {
    const workspaceId = params.workspaceId

    // Use the correct Django backend URL with trailing slash
    const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/workspaces/${workspaceId}/credit-usage/`

    try {
        // Extract authorization from the incoming request
        const authHeader = request.headers.get('Authorization')

        // Call the Django backend with proper trailing slash
        const response = await fetch(backendUrl, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: authHeader || '',
            },
        })

        if (!response.ok) {
            console.error(`Backend error: ${response.status} ${response.statusText}`)
            return NextResponse.json(
                { error: `Backend returned ${response.status}: ${response.statusText}` },
                { status: response.status }
            )
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Error proxying to Django backend:', error)
        return NextResponse.json({ error: 'Failed to communicate with backend service' }, { status: 500 })
    }
}

export async function POST(request: NextRequest, { params }: { params: { workspaceId: string } }) {
    const workspaceId = params.workspaceId
    const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/workspaces/${workspaceId}/credit-usage/`

    try {
        const authHeader = request.headers.get('Authorization')
        const body = await request.json()

        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: authHeader || '',
            },
            body: JSON.stringify(body),
        })

        if (!response.ok) {
            console.error(`Backend error: ${response.status} ${response.statusText}`)
            return NextResponse.json(
                { error: `Backend returned ${response.status}: ${response.statusText}` },
                { status: response.status }
            )
        }

        const data = await response.json()
        return NextResponse.json(data, { status: response.status })
    } catch (error) {
        console.error('Error proxying POST to Django backend:', error)
        return NextResponse.json({ error: 'Failed to communicate with backend service' }, { status: 500 })
    }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    })
}
