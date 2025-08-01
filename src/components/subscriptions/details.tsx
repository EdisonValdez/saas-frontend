import * as React from 'react'

import Link from 'next/link'

import { Subscription } from '@/types/subscriptions'

import { formatDateWithTime } from '@/lib/utils'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ManageSubscriptionButton } from '@/components/subscriptions/manage-subscription-button'
import { CheckoutButton } from '@/components/subscriptions/checkout-button'
import { Button } from '@/components/ui/button'

interface SubscriptionDetailsProps {
    subscription: Subscription
}

export function SubscriptionDetails({ subscription }: SubscriptionDetailsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Workspace Subscription</CardTitle>
                <CardDescription>You can see your subscription details and update your subscription.</CardDescription>
            </CardHeader>
            <CardContent>
                <div>
                    {!subscription && <p>You are not subscribed to any plan.</p>}
                    {subscription && subscription.status === 'trialing' && (
                        <p>Trialing, ending on {formatDateWithTime(subscription.trial_end)}</p>
                    )}
                    {subscription && subscription.status === 'active' && (
                        <p>Active, ending: {formatDateWithTime(subscription.period_end)}</p>
                    )}
                    {subscription && subscription.status === 'canceled' && (
                        <p>Canceled, ending: {formatDateWithTime(subscription.cancel_at)}</p>
                    )}
                    {subscription && subscription.cancel_at_period_end && (
                        <p>Your subscription will be canceled at the end of the current period. </p>
                    )}
                    {subscription && subscription.status === 'past_due' && <p>Past Due</p>}
                    {subscription && subscription.period_start && (
                        <p>Start Date: {formatDateWithTime(subscription.period_start)}</p>
                    )}
                    {subscription && subscription.period_end && (
                        <p>End Date: {formatDateWithTime(subscription.period_end)}</p>
                    )}
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                {subscription ? (
                    <ManageSubscriptionButton />
                ) : (
                    <Link href="/pricing">
                        <Button variant="default">View Plans</Button>
                    </Link>
                )}
            </CardFooter>
        </Card>
    )
}
