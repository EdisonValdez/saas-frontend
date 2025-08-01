'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button, buttonVariants } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { ExternalLink } from 'lucide-react'

export function ManageSubscriptionButton() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const { toast } = useToast()

    const redirectToCustomerPortal = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/subscriptions/create-portal-link', {
                method: 'POST',
                headers: new Headers({ 'Content-Type': 'application/json' }),
                credentials: 'include',
            })

            if (!res.ok) {
                throw new Error('Failed to create portal link')
            }

            const data = await res.json()

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
        <Button
            onClick={redirectToCustomerPortal}
            disabled={loading}
            className={buttonVariants({ variant: 'default' })}
        >
            {loading ? 'Loading...' : (
                <>
                    Manage Subscription
                    <ExternalLink className="w-4 h-4 ml-2" />
                </>
            )}
        </Button>
    )
}
