'use client'

import { useState } from 'react'
import { WorkspaceMember } from '@/types/workspaces'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
    DialogFooter,
} from '@/components/ui/dialog'
import { WorkspaceMemberUpdateForm } from '@/components/workspaces/workspace-member-update-form'
import { WorkspaceMemberRemoveModal } from '@/components/workspaces/workspace-member-remove-modal'

interface WorkspaceMemberUpdateModalProps {
    membership: WorkspaceMember
}

export function WorkspaceMemberUpdateModal({ membership }: WorkspaceMemberUpdateModalProps) {
    const [open, setOpen] = useState(false)

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
                    <DialogTitle>Update the membership for {membership.user.email}</DialogTitle>
                    <DialogDescription>You can update the membership role of the user</DialogDescription>
                </DialogHeader>

                <WorkspaceMemberUpdateForm membership={membership} onSuccess={handleSuccess} />
                <WorkspaceMemberRemoveModal membership={membership} onSuccess={handleSuccess} />

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
