'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { siteConfig } from '@/config/site'

import { Invitation, Team } from '@/types/workspaces'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { Icons } from '@/components/icons'

interface TeamInvitationDeleteModalProps {
    invitation: Invitation
    team: Team
}

export function TeamInvitationDeleteModal({ team, invitation }: TeamInvitationDeleteModalProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const deleteInvitation = async () => {
        setIsLoading(true)

        const DELETE_WORKSPACE_INVITATIONS_API = `${siteConfig.paths.api.workspaces.workspaces}${team.workspace}/teams/${invitation.team}/invitations/${invitation.id}/`

        try {
            const response = await fetch(DELETE_WORKSPACE_INVITATIONS_API, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            })

            if (!response.ok) {
                throw new Error('Failed to cancel invitation')
            }

            toast({
                title: 'Success',
                description: `Invitation for ${invitation.email} deleted successfully.`,
                variant: 'default',
            })

            setOpen(false)
            router.refresh()
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to cancel the invitation. Please try again.',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive">Cancel</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Cancel Invitation</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete the invitation for <strong>{invitation.email}</strong>? This
                        action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <Button onClick={deleteInvitation} disabled={isLoading} variant="destructive">
                    {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                    Cancel Invitation
                </Button>

                <DialogFooter className="flex justify-between sm:justify-start gap-2">
                    <DialogClose asChild>
                        <Button variant="secondary">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
