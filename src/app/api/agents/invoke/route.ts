import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await auth()

    console.log('[DEBUG] Agent API request received')
    console.log('[DEBUG] Session:', session)

    if (!session?.user?.email || !session?.access) {
      console.error('[ERROR] Authentication required - no valid session or token')
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()

    if (!body.prompt || typeof body.prompt !== 'string') {
      return NextResponse.json({ error: 'Invalid request. Prompt is required.' }, { status: 400 })
    }

    // Ensure we have a workspace_id
    if (!body.workspace_id && !body.context?.workspace_id) {
      return NextResponse.json({ error: 'A workspace_id is required.' }, { status: 400 })
    }

    // Extract workspace_id from either direct property or context
    const workspace_id = body.workspace_id || body.context.workspace_id

    console.log('[DEBUG] Request body:', body)
    console.log('[DEBUG] Using workspace_id:', workspace_id)

    // Construct backend URL
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
    const apiUrl = `${backendUrl}/api/agents/invoke/`

    console.log('[DEBUG] Forwarding request to:', apiUrl)
    console.log('[DEBUG] Using token with prefix: JWT')

    // Forward the request to Django backend with JWT token and workspace_id
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `JWT ${session.access}`,
      },
      body: JSON.stringify({
        prompt: body.prompt,
        workspace_id: workspace_id,
        context: body.context || {},
      }),
    })

    console.log('[DEBUG] Backend response status:', response.status)

    // Check response status
    if (!response.ok) {
      console.error('[ERROR] Backend API error:', response.status)
      const errorText = await response.text()
      console.error('[ERROR] Error details:', errorText)

      try {
        // Try to parse as JSON
        const errorData = JSON.parse(errorText)
        return NextResponse.json(
          { error: 'Backend API error', details: errorData },
          { status: response.status }
        )
      } catch (e) {
        // Return as text if not JSON
        return NextResponse.json(
          { error: 'Backend API error', details: errorText },
          { status: response.status }
        )
      }
    }

    // Return the response from the backend
    const data = await response.json()
    console.log('[DEBUG] Backend response received successfully')
    return NextResponse.json(data)
  } catch (error) {
    console.error('[ERROR] Error invoking agent:', error)
    return NextResponse.json({ error: 'Failed to invoke agent' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed. Use POST to invoke agent.' }, { status: 405 })
}
