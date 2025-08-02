import { NextRequest, NextResponse } from 'next/server'
import { testDirectAuthentication, testBackendConnection } from '@/lib/auth-fallback'

export async function POST(req: NextRequest) {
    console.log('[DEBUG] Debug auth endpoint called')

    try {
        const body = await req.json()
        const { email, password, testType } = body

        console.log('[DEBUG] Request body received:', {
            email: email ? 'present' : 'missing',
            password: password ? 'present' : 'missing',
            testType,
        })

        // Handle different types of tests
        if (testType === 'connection') {
            console.log('[DEBUG] Running backend connection test')
            const result = await testBackendConnection()
            return NextResponse.json(result)
        }

        if (!email || !password) {
            console.log('[DEBUG] Missing email or password')
            return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 })
        }

        console.log('[DEBUG] Running direct authentication test')
        const result = await testDirectAuthentication(email, password)

        return NextResponse.json(result)
    } catch (error) {
        console.error('[DEBUG] Debug auth endpoint error:', error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                errorType: error instanceof Error ? error.name : 'Unknown',
                stack: error instanceof Error ? error.stack : undefined,
            },
            { status: 500 }
        )
    }
}

export async function GET(req: NextRequest) {
    console.log('[DEBUG] Debug auth GET endpoint called')

    try {
        // Test backend connection when GET is called
        const connectionTest = await testBackendConnection()

        return NextResponse.json({
            message: 'Debug authentication endpoint is working',
            timestamp: new Date().toISOString(),
            environment: {
                NODE_ENV: process.env.NODE_ENV,
                AUTH_SECRET_EXISTS: !!process.env.AUTH_SECRET,
                NEXTAUTH_SECRET_EXISTS: !!process.env.NEXTAUTH_SECRET,
                BACKEND_API_URL: process.env.NEXT_PUBLIC_BACKEND_API_URL || 'Using default (http://127.0.0.1:8000)',
            },
            connectionTest,
        })
    } catch (error) {
        console.error('[DEBUG] Debug auth GET error:', error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        )
    }
}
