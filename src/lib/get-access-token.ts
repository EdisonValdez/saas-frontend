import { auth } from '@/lib/auth'
import { isJWTTokenValid } from '@/lib/verify-token'

export async function getAccessToken() {
    const session = await auth()
    return session?.access
}

export async function validateAccessToken(): Promise<string | Response> {
    const accessToken = await getAccessToken()

    if (!accessToken || !(await isJWTTokenValid(accessToken))) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    return accessToken
}
