/* eslint-disable @typescript-eslint/no-unused-vars */

'use client'

import * as React from 'react'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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

import { siteConfig } from '@/config/site'

import { Team, TeamMember } from '@/types/workspaces'

import { useToast } from '@/components/ui/use-toast'

interface TeamMemberRemoveModalProps {
    membership: TeamMember
    team: Team
}

export function TeamMemberRemoveModal({ team, membership }: TeamMemberRemoveModalProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const { toast } = useToast()
    const [open, setOpen] = React.useState(false)

    const deleteWorkspace = async (workspaceId: string) => {
        setIsLoading(true)

        const REMOVE_MEMBERSHIP_API = `${siteConfig.paths.api.workspaces.workspaces}${team.workspace}/teams/${membership.team}/memberships/${membership.id}`
        try {
            const response = await fetch(REMOVE_MEMBERSHIP_API, {
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
                throw new Error('Failed to remove membership')
            }

            if (response.status === 204) {
                toast({
                    title: 'Success',
                    description: 'Membership deleted successfully',
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
        return router.refresh()
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive">Remove</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Remove membership</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to remove {membership.user.email} from the workspace? This action cannot
                        be undone.
                    </DialogDescription>
                </DialogHeader>

                <Button type="button" onClick={() => deleteWorkspace(membership.id)} disabled={isLoading}>
                    Remove membership
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
