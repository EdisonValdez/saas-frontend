import { NextRequest, NextResponse } from 'next/server'

interface OnboardingSession {
  sessionId: string
  step: number
  data: any
  createdAt: string
  updatedAt: string
  status: 'active' | 'completed' | 'abandoned'
}

// In-memory storage for demo purposes
// In production, this would be stored in a database
const sessions = new Map<string, OnboardingSession>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, step, data } = body

    // Generate new session ID if not provided
    const id = sessionId || `onboarding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()

    if (sessions.has(id)) {
      // Update existing session
      const existingSession = sessions.get(id)!
      const updatedSession: OnboardingSession = {
        ...existingSession,
        step,
        data,
        updatedAt: now,
        status: step >= 4 ? 'completed' : 'active'
      }
      sessions.set(id, updatedSession)

      return NextResponse.json({
        success: true,
        sessionId: id,
        session: updatedSession
      })
    } else {
      // Create new session
      const newSession: OnboardingSession = {
        sessionId: id,
        step,
        data,
        createdAt: now,
        updatedAt: now,
        status: 'active'
      }
      sessions.set(id, newSession)

      return NextResponse.json({
        success: true,
        sessionId: id,
        session: newSession
      }, { status: 201 })
    }
  } catch (error) {
    console.error('Error managing onboarding session:', error)
    return NextResponse.json(
      { error: 'Failed to save onboarding session' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    const session = sessions.get(sessionId)
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      session
    })
  } catch (error) {
    console.error('Error retrieving onboarding session:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve onboarding session' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    if (sessions.has(sessionId)) {
      sessions.delete(sessionId)
      return NextResponse.json({
        success: true,
        message: 'Session deleted successfully'
      })
    } else {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Error deleting onboarding session:', error)
    return NextResponse.json(
      { error: 'Failed to delete onboarding session' },
      { status: 500 }
    )
  }
}
