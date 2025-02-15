'use client'

import * as React from 'react'
import { TeamMember, Team } from '@/types/workspaces'
import { TeamMemberUpdateForm } from './team-member-update-form'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'

interface TeamMembershipUpdateModalProps {
    team: Team
    membership: TeamMember
}

export function TeamMembershipUpdateModal({ team, membership }: TeamMembershipUpdateModalProps) {
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
                    <DialogTitle>Update membership for {membership.user.email}</DialogTitle>
                    <DialogDescription>Change the role of this team member.</DialogDescription>
                </DialogHeader>
                <TeamMemberUpdateForm team={team} membership={membership} onSuccess={handleSuccess} />
            </DialogContent>
        </Dialog>
    )
}
