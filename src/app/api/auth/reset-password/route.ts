import { siteConfig } from '@/config/site'
import { getApiURL } from '@/lib/utils'

export async function POST(request: Request) {
    if (request.method === 'POST') {
        const body = await request.json()
        const url = getApiURL()
        const RESET_PASSWORD_ENDPOINT = url.concat(siteConfig.backend.api.auth.resetPassword)

        try {
            const res = await fetch(RESET_PASSWORD_ENDPOINT, {
                method: 'POST',
                headers: new Headers({ 'Content-Type': 'application/json' }),
                body: JSON.stringify(body),
            })

            if (res.status === 204) {
                return new Response(null, {
                    status: res.status,
                })
            } else {
                const data = await res.json()
                return new Response(JSON.stringify({ error: data }), {
                    status: res.status,
                })
            }
        } catch (error) {
            return new Response(
                JSON.stringify({
                    error: 'An error happened while resetting your password. Please try again.',
                }),
                {
                    status: 500,
                }
            )
        }
    } else {
        return new Response('Method Not Allowed', {
            headers: { Allow: 'POST' },
            status: 405,
        })
    }
}
