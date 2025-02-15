'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { AlertTriangle } from 'lucide-react'

import { siteConfig } from '@/config/site'

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

interface WorkspaceDeleteModalProps {
    workspaceId: string
    workspaceName: string
}

export function WorkspaceDeleteModal({ workspaceId, workspaceName }: WorkspaceDeleteModalProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const { toast } = useToast()

    const [open, setOpen] = useState(false)

    const deleteWorkspace = async (workspaceId: string) => {
        setIsLoading(true)

        const DELETE_WORKSPACE_API = `${siteConfig.paths.api.workspaces.workspaces}${workspaceId}/` // Ensure the URL is correctly formed
        try {
            const response = await fetch(DELETE_WORKSPACE_API, {
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
                    description: 'Workspace deleted successfully',
                    variant: 'default',
                })
                setOpen(false)
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
        return router.push('/dashboard')
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="destructive" className="h-8 gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span className="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">Delete</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Delete Workspace</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete the workspace {workspaceName}? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <Button type="button" onClick={() => deleteWorkspace(workspaceId)} disabled={isLoading}>
                    Delete the workspace and all its data
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
