/* eslint-disable @typescript-eslint/no-unused-vars */

'use client'

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

interface WorkspaceLeaveModalProps {
    workspaceId: string
    workspaceName: string
}

export function WorkspaceLeaveModal({ workspaceId, workspaceName }: WorkspaceLeaveModalProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const { toast } = useToast()

    const [open, setOpen] = useState(false)

    const handleSuccess = () => {
        setOpen(false)
    }

    const leaveWorkspace = async () => {
        setIsLoading(true)

        const LEAVE_WORKSPACE_API = `${siteConfig.paths.api.workspaces.workspaces}${workspaceId}/leave/`
        try {
            const response = await fetch(LEAVE_WORKSPACE_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            })

            setIsLoading(false)

            if (!response.ok) {
                toast({
                    title: 'Error',
                    description: 'Failed to leave workspace. Please try again.',
                    variant: 'destructive',
                })
                throw new Error('Failed to leave workspace')
            }

            if (response.status === 204) {
                toast({
                    title: 'Success',
                    description: 'You have left the workspace',
                    variant: 'default',
                })
                setOpen(false)
                router.push('/dashboard')
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
                    <DialogTitle>Leave Workspace</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to leave the workspace {workspaceName}? You will lose access to its
                        resources.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-start">
                    <Button type="button" onClick={leaveWorkspace} disabled={isLoading}>
                        Confirm
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
