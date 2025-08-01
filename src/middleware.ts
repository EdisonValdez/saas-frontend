import { NextRequest, NextResponse } from 'next/server'

export const BASE_PATH = '/api/auth'

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|login|pricing|about).*)',
        '/api/workspaces/:path*',
        '/api/teams/:path*',
        '/api/invitations/checkout',
        '/api/subscriptions/create-portal-link',
        '/dashboard/:path*',
    ],
}

// Temporary middleware to fix compatibility issues
export default function middleware(req: NextRequest) {
    console.log('Middleware', req.url)
    // Auth temporarily disabled for demo purposes
    return NextResponse.next()
}
