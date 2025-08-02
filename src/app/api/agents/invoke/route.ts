import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getApiURL } from '@/lib/utils'

// Rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT_MAX_REQUESTS = 30
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute in milliseconds

interface AgentRequest {
    prompt: string
    [key: string]: any // Allow additional properties
}

function checkRateLimit(userKey: string): boolean {
    const now = Date.now()
    const userLimit = rateLimitStore.get(userKey)

    if (!userLimit || now > userLimit.resetTime) {
        // Reset or create new limit window
        rateLimitStore.set(userKey, {
            count: 1,
            resetTime: now + RATE_LIMIT_WINDOW,
        })
        return true
    }

    if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
        return false
    }

    userLimit.count++
    return true
}

export async function POST(req: NextRequest) {
    try {
        // Get current session
        const session = await getServerSession(authOptions)

        // Debug session information
        console.log('Session data:', {
            user: session?.user?.email,
            hasAccess: !!(session as any)?.access,
            accessTokenPreview: (session as any)?.access ? `${(session as any).access.substring(0, 20)}...` : 'None',
        })

        if (!session?.user?.email) {
            console.error('No user session found')
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
        }

        // Check for access token in session
        const accessToken = (session as any)?.access
        if (!accessToken) {
            console.error('No access token found in session')
            return NextResponse.json({ error: 'Authentication required - no access token' }, { status: 401 })
        }

        // Rate limiting check
        const userKey = session.user.email
        if (!checkRateLimit(userKey)) {
            console.warn(`Rate limit exceeded for user: ${userKey}`)
            return NextResponse.json({ error: 'Rate limit exceeded. Maximum 30 requests per minute.' }, { status: 429 })
        }

        // Parse request body
        const body: AgentRequest = await req.json()

        if (!body.prompt || typeof body.prompt !== 'string') {
            return NextResponse.json({ error: 'Invalid request. Prompt is required.' }, { status: 400 })
        }

        if (body.prompt.length > 5000) {
            return NextResponse.json({ error: 'Prompt too long. Maximum 5000 characters allowed.' }, { status: 400 })
        }

        // Construct backend URL - ensure trailing slash for Django compatibility
        const backendUrl = getApiURL()
        const apiUrl = `${backendUrl}/api/agents/invoke/`

        console.log('Forwarding request to:', apiUrl)
        console.log('With authorization header:', `JWT ${accessToken.substring(0, 20)}...`)

        // Forward the request to Django backend with JWT token
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${accessToken}`, // Important: Use JWT prefix as expected by Django
            },
            body: JSON.stringify(body),
        })

        // Check response status
        if (!response.ok) {
            console.error('Backend error:', response.status, response.statusText)
            let errorData: any
            try {
                errorData = await response.json()
                console.error('Error details:', errorData)
            } catch (e) {
                errorData = await response.text()
                console.error('Error text:', errorData)
            }

            return NextResponse.json(
                {
                    error: 'Backend API error',
                    details: errorData,
                    status: response.status,
                },
                { status: response.status }
            )
        }

        // Return the response from the backend
        const data = await response.json()
        console.log('Successfully received response from backend')
        return NextResponse.json(data)
    } catch (error) {
        console.error('Error invoking agent:', error)

        // Handle specific error types
        if (error instanceof SyntaxError) {
            return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
        }

        if (error instanceof TypeError && error.message.includes('fetch')) {
            return NextResponse.json({ error: 'Failed to connect to backend service' }, { status: 503 })
        }

        return NextResponse.json({ error: 'Failed to invoke agent' }, { status: 500 })
    }
}

export async function GET() {
    return NextResponse.json({ error: 'Method not allowed. Use POST to invoke agent.' }, { status: 405 })
}
