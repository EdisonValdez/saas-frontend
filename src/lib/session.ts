import { auth } from '@/lib/auth'

import { isJWTTokenValid } from '@/lib/verify-token'

export async function getCurrentUserServer() {
    try {
        const session = await auth()

        console.log('[DEBUG] getCurrentUserServer - session exists:', !!session)
        console.log('[DEBUG] getCurrentUserServer - user exists:', !!session?.user)
        console.log('[DEBUG] getCurrentUserServer - access token exists:', !!session?.access)

        // For development, trust the session if user exists
        if (process.env.NODE_ENV === 'development' && session?.user?.email) {
            console.log('[DEBUG] Development mode: trusting session for user:', session.user.email)
            return session.user
        }

        if (session?.access) {
            try {
                console.log('[DEBUG] Validating JWT token...')
                const isTokenValid = await isJWTTokenValid(session.access)
                console.log('[DEBUG] Token validation result:', isTokenValid)
                if (!isTokenValid) {
                    console.log('[DEBUG] Token invalid, returning null')
                    return null
                }
            } catch (error) {
                console.error('[DEBUG] Token validation error:', error)
                // In development, if token validation fails but we have a user, trust it
                if (process.env.NODE_ENV === 'development' && session?.user?.email) {
                    console.log('[DEBUG] Token validation failed but trusting development session')
                    return session.user
                }
                return null
            }
        }

        return session?.user
    } catch (error) {
        console.error('[DEBUG] Auth session error:', error)
        return null
    }
}
