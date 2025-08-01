import { NextResponse } from 'next/server'

import { siteConfig } from '@/config/site'
import { getAccessToken } from '@/lib/get-access-token'
import { getApiURL } from '@/lib/utils'
import { isJWTTokenValid } from '@/lib/verify-token'

export async function GET(request: Request) {
    if (request.method === 'GET') {
        // We can get pricing based on the user's subscription status.
        //If the user is not subscribed, we can show them the pricing for the products they can subscribe to.
        //If the user is subscribed, we can show them the pricing for the products they can upgrade to.
        // so we update the config headers based on the session access token
        let config = {
            headers: new Headers({ 'Content-Type': 'application/json' }),
        }

        const accessToken = await getAccessToken()

        // If there is a session, we verify the token and update the config headers
        if (accessToken) {
            const isTokenValid = await isJWTTokenValid(accessToken)
            if (isTokenValid) {
                config = {
                    headers: new Headers({
                        'Content-Type': 'application/json',
                        Authorization: `JWT ${accessToken}`,
                    }),
                }
            }
        }

        //Get the user's subscribable products from the backend
        const url = getApiURL()
        const PRODUCTS_ENDPOINT = url.concat(siteConfig.backend.api.subscriptions.userSubscribableProducts)
        try {
            const res = await fetch(PRODUCTS_ENDPOINT, config)
            const data = await res.json()
            return NextResponse.json(data, { status: res.status })
        } catch (error) {
            return new NextResponse(
                JSON.stringify({
                    error: 'An error happened while sending the activation link. Please try again.',
                }),
                {
                    status: 500,
                }
            )
        }
    } else {
        return new NextResponse('Method Not Allowed', {
            headers: { Allow: 'GET' },
            status: 405,
        })
    }
}
