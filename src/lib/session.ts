import { auth } from '@/lib/auth'

import { isJWTTokenValid } from '@/lib/verify-token'

export async function getCurrentUserServer() {
    const session = await auth()

    if (session?.access) {
        const isTokenValid = await isJWTTokenValid(session.access)
        if (!isTokenValid) {
            return null
        }
    }

    return session?.user
}
