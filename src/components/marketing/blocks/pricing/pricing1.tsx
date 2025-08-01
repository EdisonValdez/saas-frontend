'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

import { siteConfig } from '@/config/site'
import { UserDetails } from '@/types/auth'
import { StripePrice } from '@/types/subscriptions'

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

import { Badge } from '@/components/ui/badge'
import { CheckoutButton } from '@/components/subscriptions/checkout-button'

interface PricingProps {
    prices: StripePrice[]
    user?: UserDetails | null
}

const formatPrice = (price: number | string, currency: string): string => {
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price
    return `${currency} ${(numericPrice / 100).toFixed(2)}`
}

export function Pricing1({ prices, user }: PricingProps) {
    const defaultWorkspaceId = user?.workspaces?.[0]?.id || null

    const { data: session } = useSession()
    const router = useRouter()
    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(defaultWorkspaceId)
    const [showMonthly, setShowMonthly] = useState(false)

    const sortedPrices = prices
        .filter((item) => item.freq === (showMonthly ? 'RecurringInterval.MONTH_1' : 'RecurringInterval.YEAR_1'))
        .sort((a, b) => Number(a.price) - Number(b.price))

    const { toast } = useToast()

    const handleValueChange = (value: string) => setSelectedWorkspaceId(value)



    return (
        <div className="w-full py-20 lg:py-40 container flex flex-col gap-12 md:max-w-[64rem]">
            <div className="text-center">
                <Badge>Pricing</Badge>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight mt-4">Flexible Pricing for Your Needs</h2>
                <p className="text-lg text-muted-foreground mt-4">
                    Simple, transparent pricing plans designed to scale with your business.
                </p>
                <div className="flex items-center justify-center mt-6 space-x-3">
                    <Switch
                        id="plan-toggle"
                        checked={showMonthly}
                        onCheckedChange={() => setShowMonthly(!showMonthly)}
                        aria-label="Toggle between monthly and yearly plans"
                    />
                    <Label htmlFor="plan-toggle">{showMonthly ? 'Monthly' : 'Yearly'} pricing</Label>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                {sortedPrices.length > 0 ? (
                    sortedPrices.map((price) => (
                        <Card key={price.price_id} className="shadow-md border">
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold">{price.name}</CardTitle>
                                <CardDescription>{price.nickname}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center">
                                    <p className="text-4xl font-bold">{formatPrice(price.price, price.currency)}</p>
                                    <p className="text-sm text-muted-foreground">{showMonthly ? '/ month' : '/ year'}</p>
                                </div>
                                <div className="mt-6">
                                    {price.services?.map((feature) => (
                                        <div key={feature.feature_id} className="flex items-start space-x-2">
                                            <p className="text-sm text-muted-foreground">{feature.feature_desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col items-center mt-4 space-y-2">
                                {session && user?.workspaces && user?.workspaces?.length > 0 && (
                                    <Select value={selectedWorkspaceId || ''} onValueChange={handleValueChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a workspace" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Workspaces</SelectLabel>
                                                {user &&
                                                    user.workspaces?.map((workspace) => (
                                                        <SelectItem key={workspace.id} value={workspace.id}>
                                                            {workspace.name}
                                                        </SelectItem>
                                                    ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                )}
                                <CheckoutButton
                                priceId={price.price_id}
                                workspaceId={selectedWorkspaceId}
                                planName={price.name}
                                className="w-full px-4 py-2 text-sm"
                            />
                            </CardFooter>
                        </Card>
                    ))
                ) : (
                    <Card className="shadow-md border col-span-full">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold text-center">No Pricing Plans Available</CardTitle>
                            <CardDescription className="text-center">
                                Pricing plans are currently being updated. Please check back later.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-muted-foreground">
                                If you need immediate assistance, please contact our support team.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
