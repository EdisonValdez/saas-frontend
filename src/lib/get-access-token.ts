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

export async function getAuthHeaders(): Promise<Record<string, string>> {
    const accessToken = await getAccessToken()

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    }

    if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`
    }

    return headers
}

export async function createAuthorizedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = await getAuthHeaders()

    return fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            ...headers,
        },
    })
}
