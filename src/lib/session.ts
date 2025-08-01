import { auth } from '@/lib/auth'

import { isJWTTokenValid } from '@/lib/verify-token'

export async function getCurrentUserServer() {
    try {
        const session = await auth()

        if (session?.access) {
            try {
                const isTokenValid = await isJWTTokenValid(session.access)
                if (!isTokenValid) {
                    return null
                }
            } catch (error) {
                console.error('Token validation error:', error)
                return null
            }
        }

        return session?.user
    } catch (error) {
        console.error('Auth session error:', error)
        return null
    }
}
