'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, CreditCard, Lock } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'

interface CheckoutButtonProps {
    priceId: string
    workspaceId?: string | null
    planName?: string
    className?: string
    variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive'
    size?: 'default' | 'sm' | 'lg'
    disabled?: boolean
}

export function CheckoutButton({ 
    priceId, 
    workspaceId, 
    planName = 'this plan',
    className,
    variant = 'default',
    size = 'default',
    disabled = false
}: CheckoutButtonProps) {
    const [loading, setLoading] = useState(false)
    const { data: session } = useSession()
    const router = useRouter()
    const { toast } = useToast()

    const handleCheckout = async () => {
        if (!session) {
            const currentUrl = window.location.pathname + window.location.search
            router.push(`/login?callbackUrl=${encodeURIComponent(currentUrl)}`)
            return
        }

        if (!priceId) {
            toast({
                title: 'Invalid Plan',
                description: 'Please select a valid plan.',
                variant: 'destructive',
            })
            return
        }

        setLoading(true)
        try {
            const payload = {
                price_id: priceId,
                ...(workspaceId ? { workspace_id: workspaceId } : {}),
            }

            const response = await fetch('/api/subscriptions/checkout', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(payload),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || `HTTP error: ${response.status}`)
            }

            const { session_id } = await response.json()
            
            if (!session_id) {
                throw new Error('No session ID received from server')
            }

            const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

            if (!stripe) {
                throw new Error('Failed to initialize Stripe')
            }

            const { error } = await stripe.redirectToCheckout({ sessionId: session_id })

            if (error) {
                throw new Error(error.message || 'Checkout failed')
            }
        } catch (error) {
            console.error('Checkout error:', error)
            toast({
                title: 'Checkout Failed',
                description: error instanceof Error ? error.message : 'An error occurred while processing your subscription.',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button 
            onClick={handleCheckout}
            disabled={loading || disabled}
            variant={variant}
            size={size}
            className={className}
        >
            {loading ? (
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                </>
            ) : session ? (
                <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Subscribe to {planName}
                </>
            ) : (
                <>
                    <Lock className="w-4 h-4 mr-2" />
                    Login to Subscribe
                </>
            )}
        </Button>
    )
}
