import { siteConfig } from '@/config/site'
import { getApiURLWithEndpoint } from '@/lib/utils'

export async function POST(request: Request) {
    if (request.method === 'POST') {
        const body = await request.json()

        // Construct the API URL and endpoint
        const USER_REGISTER_ENDPOINT = siteConfig.backend.api.auth.users
        const url = getApiURLWithEndpoint(USER_REGISTER_ENDPOINT)

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: new Headers({ 'Content-Type': 'application/json' }),
                body: JSON.stringify(body),
            })

            const data = await response.json()

            if (response.status === 400) {
                return new Response(JSON.stringify({ data: data }), {
                    status: response.status,
                })
            }

            if (!response.ok) {
                return new Response(JSON.stringify({ error: 'An error happened while registering' }), {
                    status: 500,
                })
            }

            return new Response(JSON.stringify({ data: data }), {
                status: response.status,
            })
        } catch (error) {
            return new Response(JSON.stringify({ error: 'An error happened while registering' }), {
                status: 500,
            })
        }
    } else {
        return new Response('Method Not Allowed', {
            headers: { Allow: 'POST' },
            status: 405,
        })
    }
}
