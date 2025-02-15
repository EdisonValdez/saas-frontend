'use client'

import * as React from 'react'

import { Workspace } from '@/types/workspaces'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog'
import { WorkspaceInvitationForm } from '@/components/workspaces/workspace-invitation-form'

interface WorkspaceInvitationSendModalProps {
    workspace: Workspace
}

export function WorkspaceInvitationSendModal({ workspace }: WorkspaceInvitationSendModalProps) {
    const [open, setOpen] = React.useState(false)

    const handleSuccess = () => {
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="default">Invite to Workspace</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Invite to {workspace.name}</DialogTitle>
                    <DialogDescription>Invite users to join {workspace.name}</DialogDescription>
                </DialogHeader>

                <WorkspaceInvitationForm workspace={workspace} onSuccess={handleSuccess} />

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
