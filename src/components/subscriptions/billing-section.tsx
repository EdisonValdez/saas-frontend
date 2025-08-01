'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { UserDetails } from '@/types/auth'
import { Subscription } from '@/types/subscriptions'
import { formatDateWithTime } from '@/lib/utils'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { CreditCard, Receipt, Calendar, CheckCircle2, AlertCircle, XCircle, ExternalLink, Settings } from 'lucide-react'

interface BillingSectionProps {
    user: UserDetails
    subscription?: Subscription | null
}

const getStatusIcon = (status?: string) => {
    switch (status) {
        case 'active':
            return <CheckCircle2 className="w-4 h-4 text-green-600" />
        case 'trialing':
            return <Calendar className="w-4 h-4 text-blue-600" />
        case 'canceled':
            return <XCircle className="w-4 h-4 text-red-600" />
        case 'past_due':
            return <AlertCircle className="w-4 h-4 text-yellow-600" />
        default:
            return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
}

const getStatusColor = (status?: string) => {
    switch (status) {
        case 'active':
            return 'bg-green-100 text-green-800'
        case 'trialing':
            return 'bg-blue-100 text-blue-800'
        case 'canceled':
            return 'bg-red-100 text-red-800'
        case 'past_due':
            return 'bg-yellow-100 text-yellow-800'
        default:
            return 'bg-gray-100 text-gray-800'
    }
}

export function BillingSection({ user, subscription }: BillingSectionProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const { toast } = useToast()

    const handleManageSubscription = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/subscriptions/create-portal-link', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            })

            if (!response.ok) {
                throw new Error('Failed to create portal link')
            }

            const data = await response.json()

            if (data.url) {
                window.location.href = data.url
            } else {
                throw new Error('No portal URL received')
            }
        } catch (error) {
            console.error('Failed to open customer portal:', error)
            toast({
                title: 'Error',
                description: 'Failed to open customer portal. Please try again.',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Subscription & Billing</h2>
                    <p className="text-muted-foreground">
                        Manage your subscription, payment methods, and billing information
                    </p>
                </div>
                <Settings className="w-6 h-6 text-muted-foreground" />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Current Plan Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5" />
                            Current Plan
                        </CardTitle>
                        <CardDescription>Your active subscription details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {subscription ? (
                            <>
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">Status</span>
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(subscription.status)}
                                        <Badge className={getStatusColor(subscription.status)}>
                                            {subscription.status?.charAt(0).toUpperCase() +
                                                subscription.status?.slice(1)}
                                        </Badge>
                                    </div>
                                </div>

                                <Separator />

                                {subscription.status === 'trialing' && subscription.trial_end && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Trial ends</span>
                                        <span className="text-sm font-medium">
                                            {formatDateWithTime(subscription.trial_end)}
                                        </span>
                                    </div>
                                )}

                                {subscription.status === 'active' && subscription.period_end && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Next billing</span>
                                        <span className="text-sm font-medium">
                                            {formatDateWithTime(subscription.period_end)}
                                        </span>
                                    </div>
                                )}

                                {subscription.status === 'canceled' && subscription.cancel_at && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Cancels on</span>
                                        <span className="text-sm font-medium">
                                            {formatDateWithTime(subscription.cancel_at)}
                                        </span>
                                    </div>
                                )}

                                {subscription.period_start && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Started</span>
                                        <span className="text-sm font-medium">
                                            {formatDateWithTime(subscription.period_start)}
                                        </span>
                                    </div>
                                )}

                                {subscription.cancel_at_period_end && (
                                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <p className="text-sm text-yellow-800">
                                            Your subscription will be canceled at the end of the current period.
                                        </p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-4">
                                <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-muted-foreground mb-4">No active subscription</p>
                                <Link href="/pricing">
                                    <Button variant="default" size="sm">
                                        View Plans
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Billing Management Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Receipt className="w-5 h-5" />
                            Billing Management
                        </CardTitle>
                        <CardDescription>Manage payment methods and view billing history</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                                <CreditCard className="w-4 h-4 text-muted-foreground" />
                                <span>Payment methods</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Receipt className="w-4 h-4 text-muted-foreground" />
                                <span>Billing history</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Settings className="w-4 h-4 text-muted-foreground" />
                                <span>Billing information</span>
                            </div>
                        </div>

                        <Separator />

                        <Button
                            onClick={handleManageSubscription}
                            disabled={loading}
                            className="w-full"
                            variant={subscription ? 'default' : 'secondary'}
                        >
                            {loading ? (
                                'Loading...'
                            ) : (
                                <>
                                    {subscription ? 'Manage Subscription' : 'Set Up Billing'}
                                    <ExternalLink className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </Button>

                        {subscription && (
                            <p className="text-xs text-muted-foreground">
                                Opens Stripe Customer Portal in a new window
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common billing and subscription tasks</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <Link href="/pricing" className="block">
                            <Button variant="outline" className="w-full justify-start">
                                <Calendar className="w-4 h-4 mr-2" />
                                View All Plans
                            </Button>
                        </Link>

                        <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={handleManageSubscription}
                            disabled={loading || !subscription}
                        >
                            <Receipt className="w-4 h-4 mr-2" />
                            Download Invoices
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={handleManageSubscription}
                            disabled={loading || !subscription}
                        >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Update Payment Method
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
