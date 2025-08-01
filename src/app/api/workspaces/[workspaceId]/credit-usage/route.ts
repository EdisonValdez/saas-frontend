import { NextRequest, NextResponse } from 'next/server'
import * as z from 'zod'
import { getDjangoUrl } from '@/config/api'
import { getAccessToken } from '@/lib/get-access-token'
import { isJWTTokenValid } from '@/lib/verify-token'

const routeContextSchema = z.object({
    params: z.object({
        workspaceId: z.string(),
    }),
})

export async function GET(request: NextRequest, context: z.infer<typeof routeContextSchema>) {
    try {
        // Authenticate the request
        const accessToken = await getAccessToken()
        
        if (!accessToken || !(await isJWTTokenValid(accessToken))) {
            return NextResponse.json(
                { error: 'Unauthorized' }, 
                { status: 401 }
            )
        }

        const { params } = routeContextSchema.parse(context)
        const { workspaceId } = params

        // Map to Django endpoint for credit usage
        const djangoEndpoint = `/api/workspaces/${workspaceId}/credit-usage/`
        const djangoUrl = getDjangoUrl(djangoEndpoint)

        // Forward request to Django backend
        const response = await fetch(djangoUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `JWT ${accessToken}`,
            },
        })

        if (!response.ok) {
            // Handle specific Django error responses
            const errorData = await response.json().catch(() => ({ 
                error: `Backend API error: ${response.status}` 
            }))
            
            return NextResponse.json(
                { 
                    error: errorData.detail || errorData.error || 'Failed to fetch credit usage',
                    status: response.status 
                }, 
                { status: response.status }
            )
        }

        const data = await response.json()
        
        // Ensure the response has the expected structure
        const creditUsage = {
            used: data.used || 0,
            limit: data.limit || 0,
            remaining: (data.limit || 0) - (data.used || 0),
            period_start: data.period_start,
            period_end: data.period_end,
            ...data // Include any additional fields from Django
        }

        return NextResponse.json(creditUsage)

    } catch (error) {
        console.error('Credit usage route error:', error)
        
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { 
                    error: 'Invalid request parameters', 
                    details: error.issues 
                }, 
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: 'Internal server error' }, 
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest, context: z.infer<typeof routeContextSchema>) {
    try {
        // Authenticate the request
        const accessToken = await getAccessToken()
        
        if (!accessToken || !(await isJWTTokenValid(accessToken))) {
            return NextResponse.json(
                { error: 'Unauthorized' }, 
                { status: 401 }
            )
        }

        const { params } = routeContextSchema.parse(context)
        const { workspaceId } = params

        // Parse request body
        const body = await request.json().catch(() => ({}))

        // Map to Django endpoint for credit usage operations (e.g., reserving credits)
        const djangoEndpoint = `/api/workspaces/${workspaceId}/credit-usage/`
        const djangoUrl = getDjangoUrl(djangoEndpoint)

        // Forward request to Django backend
        const response = await fetch(djangoUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `JWT ${accessToken}`,
            },
            body: JSON.stringify(body),
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ 
                error: `Backend API error: ${response.status}` 
            }))
            
            return NextResponse.json(
                { 
                    error: errorData.detail || errorData.error || 'Failed to update credit usage',
                    status: response.status 
                }, 
                { status: response.status }
            )
        }

        const data = await response.json()
        return NextResponse.json(data, { status: response.status })

    } catch (error) {
        console.error('Credit usage POST route error:', error)
        
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { 
                    error: 'Invalid request parameters', 
                    details: error.issues 
                }, 
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: 'Internal server error' }, 
            { status: 500 }
        )
    }
}

// Handle OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    })
}
