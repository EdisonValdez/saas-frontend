'use client'

import * as React from 'react'

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

import { Invitation } from '@/types/workspaces'
import { TeamInvitationUpdateForm } from './invitation-update-form'

interface TeamInvitationUpdateModalProps {
    invitation: Invitation
}

export function TeamInvitationUpdateModal({ invitation }: TeamInvitationUpdateModalProps) {
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
                    <DialogTitle>Update the role of {invitation.email}</DialogTitle>
                    <DialogDescription>
                        You can update the role of the invitations that has not yet been accepted
                    </DialogDescription>
                </DialogHeader>

                <TeamInvitationUpdateForm invitation={invitation} onSuccess={handleSuccess} />

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
