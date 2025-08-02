import { auth } from '@/lib/auth'

import { isJWTTokenValid } from '@/lib/verify-token'

export async function getCurrentUserServer() {
    try {
        const session = await auth()

        // For development, trust the session if user exists
        if (process.env.NODE_ENV === 'development' && session?.user?.email) {
            return session.user
        }

        if (session?.access) {
            try {
                const isTokenValid = await isJWTTokenValid(session.access)
                if (!isTokenValid) {
                    return null
                }
            } catch (error) {
                // In development, if token validation fails but we have a user, trust it
                if (process.env.NODE_ENV === 'development' && session?.user?.email) {
                    return session.user
                }
                return null
            }
        }

        return session?.user
    } catch (error) {
        return null
    }
}
