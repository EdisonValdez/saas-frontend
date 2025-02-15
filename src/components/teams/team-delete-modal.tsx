/* eslint-disable @typescript-eslint/no-unused-vars */

'use client'

import * as React from 'react'

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
import { useToast } from '@/components/ui/use-toast'
import { Team } from '@/types/workspaces'

interface TeamDeleteModalProps {
    team: Team
}

export function TeamDeleteModal({ team }: TeamDeleteModalProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState<boolean>(false)
    const { toast } = useToast()

    const [open, setOpen] = React.useState(false)

    const handleSuccess = () => {
        setOpen(false)
    }

    const deleteTeam = async () => {
        setIsLoading(true)

        const DELETE_TEAM_API = `${siteConfig.paths.api.workspaces.workspaces}${team.workspace}/teams/${team.id}/`

        try {
            const response = await fetch(DELETE_TEAM_API, {
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
                throw new Error('Failed to delete team')
            }

            if (response.status === 204) {
                toast({
                    title: 'Success',
                    description: `Team '${team.name}' deleted successfully`,
                    variant: 'default',
                })
                setOpen(false)
                router.push(`/dashboard/workspaces/${team.workspace}/teams/`)
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
                <Button variant="destructive">Delete Team</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Delete Team</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete the team {team.name}? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <Button type="button" onClick={deleteTeam} disabled={isLoading}>
                    Delete the team and all its data
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
