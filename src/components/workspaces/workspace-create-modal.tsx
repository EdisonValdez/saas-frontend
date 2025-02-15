'use client'

import * as React from 'react'

import { PlusCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTrigger,
    DialogTitle,
    DialogHeader,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog'

import { WorkspaceCreateForm } from '@/components/workspaces/workspace-create-form'

export function WorkspaceCreateModal() {
    const [open, setOpen] = React.useState(false)

    const handleSuccess = () => {
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="h-8 gap-1">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Workspace</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add a Workspace</DialogTitle>
                    <DialogDescription>Create a new workspace and invite new members</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-2">
                    <WorkspaceCreateForm onSuccess={handleSuccess} />
                </div>

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
