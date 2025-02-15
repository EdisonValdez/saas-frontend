'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { siteConfig } from '@/config/site'

import { Invitation } from '@/types/workspaces'

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

interface WorkspaceInvitationDeleteModalProps {
    invitation: Invitation
}

export function WorkspaceInvitationDeleteModal({ invitation }: WorkspaceInvitationDeleteModalProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const { toast } = useToast()
    const [open, setOpen] = useState(false)

    if (!invitation || !invitation.workspace) return null

    const deleteInvitation = async (invitationId: string) => {
        setIsLoading(true)

        const DELETE_WORKSPACE_INVITATIONS_API = `${siteConfig.paths.api.workspaces.workspaces}${invitation.workspace}/invitations/${invitationId}/` // Ensure the URL is correctly formed and the correct endpoint is us

        try {
            const response = await fetch(DELETE_WORKSPACE_INVITATIONS_API, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            setIsLoading(false)

            if (!response.ok) {
                toast({
                    title: 'Something went wrong.',
                    description: 'Oops! Something went wrong. Please try again.',
                    variant: 'destructive',
                })
                throw new Error('Failed to delete workspace')
            }

            if (response.status === 204) {
                toast({
                    title: 'Success',
                    description: 'Invitation deleted successfully',
                    variant: 'default',
                })
                setOpen(false)
                return router.refresh()
            } else {
                toast({
                    title: 'Error',
                    description: 'Oops! Something went wrong. Please try again.',
                    variant: 'destructive',
                })
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Oops! Something went wrong. Please try again.',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive">Delete Invitation</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Cancel Invitation for {invitation.email}</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete the invitation for {invitation.email}? This action cannot be
                        undone.
                    </DialogDescription>
                </DialogHeader>

                <Button type="button" onClick={() => deleteInvitation(invitation.id)} disabled={isLoading}>
                    Cancel the invitation
                </Button>

                <DialogFooter className="sm:justify-start">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">
                            Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
