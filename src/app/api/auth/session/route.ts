import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function GET(request: NextRequest) {
    try {
        // Get the token from NextAuth.js
        const token = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET || process.env.SECRET,
        })

        // If no token, return an unauthenticated session
        if (!token) {
            return NextResponse.json({
                user: null,
                expires: null,
            })
        }

        // Return a session object matching NextAuth's structure
        return NextResponse.json({
            user: {
                name: token.name || null,
                email: token.email || null,
                image: token.picture || null,
                id: token.sub || null,
            },
            expires: token.exp ? new Date(token.exp * 1000).toISOString() : null,
            access: token.access || null,
            refresh: token.refresh || null,
        })
    } catch (error) {
        console.error('Error in auth session route:', error)
        return NextResponse.json({ error: 'Authentication service unavailable' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { action } = body

        switch (action) {
            case 'refresh': {
                const token = await getToken({
                    req: request,
                    secret: process.env.NEXTAUTH_SECRET || process.env.SECRET,
                })

                if (!token?.refresh) {
                    return NextResponse.json({ error: 'No refresh token available' }, { status: 401 })
                }

                try {
                    // Call Django refresh endpoint
                    const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/auth/jwt/refresh/`
                    const refreshResponse = await fetch(backendUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ refresh: token.refresh }),
                    })

                    if (!refreshResponse.ok) {
                        const errorData = await refreshResponse.json().catch(() => ({}))
                        return NextResponse.json(
                            { error: errorData.detail || 'Failed to refresh token' },
                            { status: refreshResponse.status }
                        )
                    }

                    const refreshData = await refreshResponse.json()

                    return NextResponse.json({
                        user: token.user || {},
                        access: refreshData.access,
                        refresh: refreshData.refresh || token.refresh,
                        expires: token.exp ? new Date(token.exp * 1000).toISOString() : null,
                    })
                } catch (error) {
                    console.error('Refresh token error:', error)
                    return NextResponse.json({ error: 'Failed to refresh session' }, { status: 500 })
                }
            }

            case 'validate': {
                const { token: tokenToValidate } = body

                if (!tokenToValidate) {
                    return NextResponse.json({ error: 'Token is required' }, { status: 400 })
                }

                try {
                    const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/auth/jwt/verify/`
                    const verifyResponse = await fetch(backendUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ token: tokenToValidate }),
                    })

                    return NextResponse.json({
                        valid: verifyResponse.ok,
                    })
                } catch (error) {
                    console.error('Token validation error:', error)
                    return NextResponse.json({
                        valid: false,
                    })
                }
            }

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }
    } catch (error) {
        console.error('Session POST route error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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
