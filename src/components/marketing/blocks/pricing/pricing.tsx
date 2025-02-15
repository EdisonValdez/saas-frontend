'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

import { siteConfig } from '@/config/site'
import { UserDetails } from '@/types/auth'
import { PlanFeature, StripePrice } from '@/types/subscriptions'

import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

import { loadStripe } from '@stripe/stripe-js'

interface PricingProps {
    prices: StripePrice[]
    user?: UserDetails | null
}

// const formatPrice = (price: number, currency: string): string => `${currency} ${(price / 100).toFixed(2)}`

const formatPrice = (price: number | string, currency: string): string => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price
    return `${currency} ${(numericPrice / 100).toFixed(2)}`
}

export function Pricing({ prices, user }: PricingProps) {
    const { data: session } = useSession()
    const router = useRouter()
    const defaultWorkspaceId = user && user.workspaces ? (user?.workspaces[0].id as string | null) : null

    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(defaultWorkspaceId)
    const [showMonthly, setShowMonthly] = useState(false)

    const { toast } = useToast()

    const handleValueChange = (value: string) => setSelectedWorkspaceId(value)

    const processSubscription = async (planId: string, workspaceId: string | null) => {
        if (!session) {
            const currentUrl = window.location.pathname + window.location.search
            router.push(`/login?callbackUrl=${encodeURIComponent(currentUrl)}`)
            return
        }

        if (!planId) {
            toast({
                title: 'Invalid Plan',
                description: 'Please select a valid plan.',
                variant: 'destructive',
            })
            return
        }

        const subscriptionRequestPayload = {
            price_id: planId,
            ...(workspaceId ? { workspace_id: workspaceId } : {}),
        }

        try {
            const response = await fetch(siteConfig.paths.api.subscriptions.checkout, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subscriptionRequestPayload),
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const resData = await response.json()
            const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

            if (!stripe) {
                console.error('Stripe failed to initialize')
                toast({
                    title: 'Stripe Error',
                    description: 'Failed to initialize payment gateway.',
                    variant: 'destructive',
                })
                return
            }

            const { error } = await stripe.redirectToCheckout({ sessionId: resData.session_id })

            if (error) {
                console.error('Stripe checkout error:', error)
                toast({
                    title: 'Checkout Failed',
                    description: 'Could not complete the checkout process.',
                    variant: 'destructive',
                })
            }
        } catch (error) {
            console.error('Subscription error:', error)
            toast({
                title: 'Error Occurred',
                description: 'An error occurred while processing your subscription. Please try again.',
                variant: 'destructive',
            })
        }
    }

    return (
        <section className="container flex flex-col gap-6 py-4 md:max-w-[64rem] md:py-6 lg:py-8">
            <div className="flex justify-center items-center space-x-2">
                <Switch
                    id="monthly-plans"
                    checked={showMonthly}
                    onCheckedChange={() => setShowMonthly(!showMonthly)}
                    aria-label="Toggle between monthly and yearly plans"
                />
                <Label htmlFor="monthly-plans">{showMonthly ? 'Monthly' : 'Yearly'} prices</Label>
            </div>

            <div className="container mx-auto px-6 py-4">
                <div className="flex flex-col items-center justify-center space-y-8 lg:-mx-4 lg:flex-row lg:items-stretch lg:space-y-0">
                    {prices &&
                        prices
                            .filter(
                                (item) =>
                                    item.freq ===
                                    (showMonthly ? 'RecurringInterval.MONTH_1' : 'RecurringInterval.YEAR_1')
                            )
                            .map((price) => (
                                <Card key={price.price_id} className="max-w-sm mx-4">
                                    <CardHeader className="text-center">
                                        <CardTitle className="text-xl font-semibold">{price.name}</CardTitle>
                                        <CardDescription className="text-gray-500 dark:text-gray-400">
                                            {formatPrice(price.price, price.currency)}{' '}
                                            {price.freq === 'RecurringInterval.MONTH_1' ? ' / monthly' : ' / yearly'}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1 space-y-4 text-gray-500 dark:text-gray-400">
                                        {price.services &&
                                            price.services.map((feature: PlanFeature) => (
                                                <div key={feature.feature_id}>{feature.feature_desc}</div>
                                            ))}
                                    </CardContent>
                                    <CardFooter className="flex flex-col space-y-4">
                                        {session && user?.workspaces && user?.workspaces?.length > 0 && (
                                            <Select
                                                value={selectedWorkspaceId as string}
                                                onValueChange={handleValueChange}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a Workspace" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectLabel>Workspaces</SelectLabel>
                                                        {user.workspaces.map((workspace) => (
                                                            <SelectItem key={workspace.id} value={workspace.id}>
                                                                {workspace.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        )}

                                        <Button
                                            onClick={() => processSubscription(price.price_id, selectedWorkspaceId)}
                                            disabled={!session}
                                        >
                                            {session ? 'Go to Checkout' : 'Login to Checkout'}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                </div>
            </div>
        </section>
    )
}
