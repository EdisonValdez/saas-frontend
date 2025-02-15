import { siteConfig } from '@/config/site'
import { getApiURLWithEndpoint } from '@/lib/utils'

export async function POST(request: Request) {
    if (request.method === 'POST') {
        const body = await request.json()

        const USER_ACTIVATE_ENDPOINT = siteConfig.backend.api.auth.userActivate
        const url = getApiURLWithEndpoint(USER_ACTIVATE_ENDPOINT)

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: new Headers({ 'Content-Type': 'application/json' }),
                body: JSON.stringify(body),
            })

            if (response.status === 403 || response.status === 400) {
                const data = await response.json()

                return new Response(JSON.stringify({ data: data }), {
                    status: response.status,
                })
            }

            if (!response.ok) {
                return new Response(JSON.stringify({ error: 'An error happened while registering' }), {
                    status: 500,
                })
            }

            if (response.status === 204) {
                return new Response(null, { status: response.status })
            } else {
                const data = await response.json()
                return new Response(JSON.stringify({ error: data }), {
                    status: response.status,
                })
            }
        } catch (error) {
            return new Response(
                JSON.stringify({
                    error: 'An error happened during activation. Please try again.',
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
