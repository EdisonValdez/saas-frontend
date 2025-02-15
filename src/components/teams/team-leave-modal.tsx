/* eslint-disable @typescript-eslint/no-unused-vars */

'use client'

import * as React from 'react'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
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
import { siteConfig } from '@/config/site'

interface TeamLeaveModalProps {
    workspaceId: string
    teamId: string // Added teamId for specificity
    teamName: string
}

export function TeamLeaveModal({ workspaceId, teamId, teamName }: TeamLeaveModalProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const { toast } = useToast()
    const [open, setOpen] = React.useState(false)

    const handleSuccess = () => {
        setOpen(false)
    }

    const leaveTeam = async () => {
        setIsLoading(true)

        const LEAVE_TEAM_API = `${siteConfig.paths.api.workspaces.workspaces}${workspaceId}/teams/${teamId}/leave/`
        try {
            const response = await fetch(LEAVE_TEAM_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            })

            setIsLoading(false)

            if (!response.ok) {
                const errorDetails = await response.json()
                toast({
                    title: 'Error',
                    description: errorDetails.error || 'Failed to leave the team. Please try again.',
                    variant: 'destructive',
                })
                throw new Error('Failed to leave the team')
            }

            if (response.status === 204) {
                toast({
                    title: 'Success',
                    description: `You have left the team ${teamName}.`,
                    variant: 'default',
                })
                setOpen(false)
                router.push(`/dashboard/workspaces/${workspaceId}`) // Redirect to the workspace page
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Oops! Something went wrong. Please try again.',
                variant: 'destructive',
            })
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="destructive" className="h-8 gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Leave</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Leave Team</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to leave the team {teamName}? You will lose access to its resources.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-start">
                    <Button type="button" onClick={leaveTeam} disabled={isLoading}>
                        {isLoading ? 'Leaving...' : 'Confirm'}
                    </Button>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">
                            Cancel
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
