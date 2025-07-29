import { NextRequest, NextResponse } from 'next/server'

// Temporary placeholder to fix compatibility issues with NextAuth v5 beta
export async function GET(request: NextRequest) {
    return NextResponse.json({ error: 'Auth temporarily disabled for demo' }, { status: 501 })
}

export async function POST(request: NextRequest) {
    return NextResponse.json({ error: 'Auth temporarily disabled for demo' }, { status: 501 })
}
