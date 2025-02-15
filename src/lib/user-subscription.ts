import { auth } from '@/lib/auth'

import { Subscription } from '@/types/subscriptions'
import { siteConfig } from '@/config/site'

import { getApiURLWithEndpoint } from './utils'

export async function getUserSubscriptionPlan(): Promise<Subscription[]> {
    const session = await auth()

    if (!session) {
        return []
        // throw new Error("No session found")
    }

    const getUserSubscriptionPlanEndpoint = getApiURLWithEndpoint(siteConfig.backend.api.subscriptions.userSubscription)

    const response = await fetch(getUserSubscriptionPlanEndpoint, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `JWT ${session?.access}`,
        },
        method: 'GET',
    })
    const data = await response.json()
    return data
}
