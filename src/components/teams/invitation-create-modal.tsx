/* eslint-disable @typescript-eslint/no-unused-vars */

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
import { Team } from '@/types/workspaces'
import { TeamInvitationCreateForm } from './invitation-create'

interface TeamInvitationSendModalProps {
    team: Team
}

export function TeamInvitationSendModal({ team }: TeamInvitationSendModalProps) {
    const [open, setOpen] = React.useState(false)

    const handleSuccess = (invitationId: string) => {
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen} modal>
            <DialogTrigger asChild>
                <Button variant="default">Invite to {team.name}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Invite to {team.name}</DialogTitle>
                    <DialogDescription>Invite users to join {team.name}</DialogDescription>
                </DialogHeader>

                <TeamInvitationCreateForm team={team} onSuccess={handleSuccess} />

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
