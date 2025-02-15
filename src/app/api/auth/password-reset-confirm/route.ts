import { siteConfig } from '@/config/site'
import { getApiURL } from '@/lib/utils'

export async function POST(request: Request) {
    if (request.method === 'POST') {
        const body = await request.json()
        const url = getApiURL()
        const CONFIRM_PASSWORD_RESET_ENDPOINT = url.concat(siteConfig.backend.api.auth.resetPasswordConfirm)

        try {
            const res = await fetch(CONFIRM_PASSWORD_RESET_ENDPOINT, {
                method: 'POST',
                headers: new Headers({ 'Content-Type': 'application/json' }),
                body: JSON.stringify(body),
            })

            if (res.status === 400) {
                const data = await res.json()
                return new Response(JSON.stringify({ data: data }), {
                    status: res.status,
                })
            }

            if (!res.ok) {
                return new Response(JSON.stringify({ error: 'An error happened while registering' }), {
                    status: 500,
                })
            }

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
