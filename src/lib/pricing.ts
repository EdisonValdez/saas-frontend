import { auth } from '@/lib/auth'

import { StripePrice } from '@/types/subscriptions'
import { siteConfig } from '@/config/site'
import { isJWTTokenValid } from '@/lib/verify-token'

import { getApiURLWithEndpoint } from './utils'

export async function getSubscribableProductPrices(): Promise<StripePrice[]> {
    const session = await auth()

    let config = {
        headers: new Headers({ 'Content-Type': 'application/json' }),
    }
    // If there is a session, we verify the token and update the config headers
    if (session?.access) {
        const isTokenValid = await isJWTTokenValid(session.access)
        if (isTokenValid) {
            config = {
                headers: new Headers({
                    'Content-Type': 'application/json',
                    Authorization: `JWT ${session.access}`,
                }),
            }
        }
    }

    const PRICES_ENDPOINT = getApiURLWithEndpoint(siteConfig.backend.api.subscriptions.userSubscribableProducts)

    try {
        const res = await fetch(PRICES_ENDPOINT, config)
        const response = await res.json()
        // Handle both wrapped and unwrapped response formats
        return response.data || response
    } catch (error) {
        throw new Error('An error happened while fetching the prices')
    }
}
