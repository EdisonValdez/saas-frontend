'use client'

import { Team } from '@/types/workspaces'

import { TeamMembershipUpdateModal } from './team-member-update-modal'
import { TeamMemberRemoveModal } from './member-remove-modal'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface TeamMembersListProps {
    team: Team
}

export function TeamMembersList({ team }: TeamMembersListProps) {
    return (
        <Card x-chunk="dashboard-05-chunk-3">
            <CardHeader>
                <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>

                            <TableHead>Update</TableHead>
                            <TableHead>Delete</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {team.members?.map((member) => (
                            <TableRow key={member.id}>
                                <TableCell className="font-medium">
                                    {member.user.email} / {member.role}
                                </TableCell>

                                <TableCell>
                                    <TeamMembershipUpdateModal team={team} membership={member} />
                                </TableCell>
                                <TableCell>
                                    <TeamMemberRemoveModal team={team} membership={member} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
