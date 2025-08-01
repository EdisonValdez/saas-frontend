import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { getDjangoUrl } from '@/config/api'
import { siteConfig } from '@/config/site'

export async function GET(request: NextRequest) {
    try {
        // Try to get the session token from NextAuth
        const token = await getToken({ 
            req: request, 
            secret: process.env.SECRET 
        })

        if (!token) {
            return NextResponse.json(
                { error: 'No active session' }, 
                { status: 401 }
            )
        }

        // Validate the access token with Django backend
        if (token.access) {
            try {
                const verifyResponse = await fetch(
                    getDjangoUrl(siteConfig.backend.api.auth.tokenVerify), 
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ token: token.access })
                    }
                )

                if (!verifyResponse.ok) {
                    // Token is invalid, try to refresh if we have a refresh token
                    if (token.refresh) {
                        const refreshResponse = await fetch(
                            getDjangoUrl(siteConfig.backend.api.auth.tokenRefresh), 
                            {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ refresh: token.refresh })
                            }
                        )

                        if (refreshResponse.ok) {
                            const refreshData = await refreshResponse.json()
                            // Return refreshed session
                            return NextResponse.json({
                                user: token.user || {},
                                access: refreshData.access,
                                refresh: refreshData.refresh || token.refresh,
                                expires: token.exp ? new Date(token.exp * 1000).toISOString() : undefined
                            })
                        }
                    }
                    
                    return NextResponse.json(
                        { error: 'Session expired' }, 
                        { status: 401 }
                    )
                }
            } catch (error) {
                console.error('Error validating token with Django:', error)
                // Continue with the session we have if Django is unreachable
            }
        }

        // Return current session data
        return NextResponse.json({
            user: token.user || {},
            access: token.access,
            refresh: token.refresh,
            expires: token.exp ? new Date(token.exp * 1000).toISOString() : undefined
        })

    } catch (error) {
        console.error('Session route error:', error)
        return NextResponse.json(
            { error: 'Internal server error' }, 
            { status: 500 }
        )
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
                    secret: process.env.SECRET 
                })

                if (!token?.refresh) {
                    return NextResponse.json(
                        { error: 'No refresh token available' }, 
                        { status: 401 }
                    )
                }

                try {
                    const refreshResponse = await fetch(
                        getDjangoUrl(siteConfig.backend.api.auth.tokenRefresh), 
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ refresh: token.refresh })
                        }
                    )

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
                        expires: token.exp ? new Date(token.exp * 1000).toISOString() : undefined
                    })

                } catch (error) {
                    console.error('Refresh token error:', error)
                    return NextResponse.json(
                        { error: 'Failed to refresh session' }, 
                        { status: 500 }
                    )
                }
            }

            case 'validate': {
                const { token: tokenToValidate } = body

                if (!tokenToValidate) {
                    return NextResponse.json(
                        { error: 'Token is required' }, 
                        { status: 400 }
                    )
                }

                try {
                    const verifyResponse = await fetch(
                        getDjangoUrl(siteConfig.backend.api.auth.tokenVerify), 
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ token: tokenToValidate })
                        }
                    )

                    return NextResponse.json({
                        valid: verifyResponse.ok
                    })

                } catch (error) {
                    console.error('Token validation error:', error)
                    return NextResponse.json({
                        valid: false
                    })
                }
            }

            default:
                return NextResponse.json(
                    { error: 'Invalid action' }, 
                    { status: 400 }
                )
        }

    } catch (error) {
        console.error('Session POST route error:', error)
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
