/* eslint-disable @typescript-eslint/no-unused-vars */

'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'

import { siteConfig } from '@/config/site'
import { cn, postData } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Icons } from '@/components/icons'

interface InvitationAcceptProps {
    invitationId: string
}

export function InvitationAccept({ invitationId }: InvitationAcceptProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState<boolean>(false)
    const { toast } = useToast()

    async function acceptInvitation() {
        setIsLoading(true)

        const ACCEPT_INVITATION_API = `${siteConfig.paths.api.invitations.invitations}${invitationId}/`

        try {
            const res = await postData({
                url: ACCEPT_INVITATION_API,
            })

            setIsLoading(false)

            if (res.status === 200) {
                toast({
                    title: 'Invitation Accepted',
                    description: 'You have successfully accepted the invitation.',
                    variant: 'default',
                })
                // Optionally, redirect the user or update the UI accordingly
                router.push('/dashboard/')
            } else {
                toast({
                    title: 'Something went wrong.',
                    description: 'Invitation acceptance failed. Please try again.',
                    variant: 'destructive',
                })
                throw new Error('Failed to create workspace')
            }
        } catch (error) {
            if (error) {
                toast({
                    title: 'Something went wrong.',
                    description: 'Invitation acceptance failed. Please try again.',
                    variant: 'destructive',
                })
            }
        }
        router.refresh()
    }

    return (
        <div className={cn('grid gap-6')}>
            <div className="flex flex-col space-y-2 text-center">
                <Icons.logo className="mx-auto h-6 w-6" />
                <h1 className="text-2xl font-semibold tracking-tight">Accept the Invitation</h1>
                <p className="text-sm text-muted-foreground">Click the button below to accept the invitation.</p>
            </div>
            <div className="grid gap-2">
                <Button
                    onClick={(event) => acceptInvitation()}
                    type="submit"
                    className={cn(buttonVariants())}
                    disabled={isLoading}
                >
                    {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                    Accept
                </Button>
            </div>
        </div>
    )
}
