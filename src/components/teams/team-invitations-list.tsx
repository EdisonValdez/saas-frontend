import { Team } from '@/types/workspaces'
import { Role, hasInvitationPermission, determineUserRole } from '@/lib/roles-permissions'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TeamInvitationUpdateModal } from './invitation-update-modal'
import { TeamInvitationDeleteModal } from './team-invitation-delete-modal'
import { TeamInvitationSendModal } from './invitation-create-modal'

interface TeamInvitationsListProps {
    team: Team
    user: any
    workspace: any
}

export function TeamInvitationsList({ team, user, workspace }: TeamInvitationsListProps) {
    if (!team || !user || !workspace) return null

    // Determine the user's role
    const userRole: Role | null = determineUserRole(user, workspace, team)
    if (!userRole) return <p>You do not have permission to view invitations.</p>

    const invitations = team.invitations || []
    const hasInvitations = invitations.length > 0

    // Check permissions
    const canSendInvitation = hasInvitationPermission(userRole, 'sendInvitation')
    const canRevokeInvitation = hasInvitationPermission(userRole, 'revokeInvitation')
    const canResendInvitation = hasInvitationPermission(userRole, 'resendInvitation')

    return (
        <Card>
            <CardHeader>
                <CardTitle>Team Invitations</CardTitle>
            </CardHeader>
            <CardContent>
                {!hasInvitations ? (
                    <div className="text-center py-4">
                        <p className="text-muted-foreground">No invitations sent yet.</p>
                        {canSendInvitation && <TeamInvitationSendModal team={team} />}
                    </div>
                ) : (
                    <>
                        {canSendInvitation && <TeamInvitationSendModal team={team} />}
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Status</TableHead>
                                    {(canRevokeInvitation || canResendInvitation) && <TableHead>Actions</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invitations.map((invitation) => (
                                    <TableRow key={invitation.id}>
                                        <TableCell>
                                            <div className="font-medium">{invitation.email}</div>
                                            <div className="text-sm text-muted-foreground">
                                                Invited by {invitation.inviter.email} as <b>{invitation.role}</b> on{' '}
                                                {new Date(invitation.created_at).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {invitation.is_accepted ? (
                                                <span className="text-green-600">Accepted</span>
                                            ) : (
                                                <span className="text-yellow-500">Pending</span>
                                            )}
                                        </TableCell>
                                        {(canRevokeInvitation || canResendInvitation) && (
                                            <TableCell className="flex space-x-2">
                                                {!invitation.is_accepted && canResendInvitation && (
                                                    <TeamInvitationUpdateModal invitation={invitation} />
                                                )}
                                                {!invitation.is_accepted && canRevokeInvitation && (
                                                    <TeamInvitationDeleteModal team={team} invitation={invitation} />
                                                )}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
