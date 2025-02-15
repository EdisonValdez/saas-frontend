'use client'

import * as React from 'react'

import { Invitation } from '@/types/workspaces'

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
import { WorkspaceInvitationUpdateForm } from '@/components/workspaces/workspace-invitation-update-form'
import { WorkspaceInvitationDeleteModal } from './workspace-invitation-delete-modal'

interface WorkspaceInvitationSendModalProps {
    invitation: Invitation
}

export function WorkspcaeInvitationUpdateModal({ invitation }: WorkspaceInvitationSendModalProps) {
    const [open, setOpen] = React.useState(false)

    const handleSuccess = () => {
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="default">Update</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Update the role for {invitation.email}</DialogTitle>
                    <DialogDescription>
                        You can update the role of the invitations that has not yet been accepted
                    </DialogDescription>
                </DialogHeader>

                <WorkspaceInvitationUpdateForm invitation={invitation} onSuccess={handleSuccess} />
                <WorkspaceInvitationDeleteModal invitation={invitation} />

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
