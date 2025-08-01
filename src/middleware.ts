import { NextRequest, NextResponse } from 'next/server'

export const config = {
    matcher: ['/dashboard/:path*'],
}

// Simplified middleware for debugging
export default function middleware(req: NextRequest) {
    return NextResponse.next()
}
