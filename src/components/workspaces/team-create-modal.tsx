'use client'

import * as React from 'react'
import { PlusCircle } from 'lucide-react'

import { Workspace } from '@/types/workspaces'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { TeamCreateForm } from '@/components/teams/team-create'

interface TeamCreateModalProps {
    workspace: Workspace
}

export function TeamCreateModal({ workspace }: TeamCreateModalProps) {
    const [open, setOpen] = React.useState(false)

    const handleSuccess = () => {
        setOpen(false)
    }
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="h-8 gap-1">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Create Team</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Team for {workspace.name}</DialogTitle>
                    <DialogDescription>You can create teams and invite users for {workspace.name}.</DialogDescription>
                </DialogHeader>
                <TeamCreateForm workspace={workspace} onSuccess={handleSuccess} />
            </DialogContent>
        </Dialog>
    )
}
