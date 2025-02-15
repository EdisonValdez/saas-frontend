import { Workspace } from '@/types/workspaces'
import { formatDateWithTime } from '@/lib/utils'
import { hasPermission, Role } from '@/lib/roles-permissions'
import { getCurrentUserServer } from '@/lib/session'
import { UserDetails } from '@/types/auth'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { WorkspaceMemberUpdateModal } from '@/components/workspaces/workspace-member-update-modal'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WorkspaceInvitationSendModal } from '@/components/workspaces/workspace-invitation-modal'

interface WorkspaceMembersListProps {
    workspace: Workspace
    userRole: Role
}

export async function WorkspaceMembersList({ workspace, userRole }: WorkspaceMembersListProps) {
    if (!workspace) return null
    const user = (await getCurrentUserServer()) as UserDetails

    const hasMembers = workspace.members && workspace.members.length > 0

    // Normalize backend role names to match frontend expectations
    const normalizeRole = (role: string): Role | null => {
        const roleMap: Record<string, Role> = {
            owner: 'WORKSPACE_OWNER',
            admin: 'WORKSPACE_ADMIN',
            member: 'MEMBER',
        }
        return roleMap[role] || null
    }

    // Role-based filtering
    const roleFilters = {
        all: null,
        admin: ['WORKSPACE_ADMIN'],
        member: ['MEMBER'],
    }

    // Determines if the current user can update a specific member
    const canUpdateMember = (memberRole: string, memberEmail: string) => {
        const normalizedMemberRole = normalizeRole(memberRole)
        if (!normalizedMemberRole) return false

        // Owners cannot update themselves
        if (userRole === 'WORKSPACE_OWNER' && memberEmail === workspace.owner.email) return false
        if (user.email === memberEmail) return false

        return hasPermission(userRole, 'updateWorkspace', 'workspace') && normalizedMemberRole !== 'WORKSPACE_OWNER'
    }

    // Renders the member table
    const renderTable = (title: string, description: string, filterRoles?: string[]) => {
        const filteredMembers = filterRoles
            ? workspace.members?.filter((member) => filterRoles.includes(normalizeRole(member.role) || ''))
            : workspace.members

        if (!filteredMembers || filteredMembers.length === 0) {
            return (
                <Card>
                    <CardHeader className="px-7">
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-center py-4">No {title.toLowerCase()} in the workspace.</p>
                    </CardContent>
                </Card>
            )
        }

        return (
            <Card>
                <CardHeader className="px-7">
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Email</TableHead>
                                <TableHead className="text-right hidden sm:table-cell">Role</TableHead>
                                {filteredMembers.some((member) =>
                                    canUpdateMember(member.role, member.user.email as string)
                                ) && <TableHead className="text-right">Update</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredMembers.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell>
                                        <div className="font-medium">{member.user.email}</div>
                                        <div className="hidden text-sm text-muted-foreground md:inline">
                                            {member.user.name}
                                        </div>
                                        <div className="hidden text-sm text-muted-foreground md:inline">
                                            Joined on {formatDateWithTime(member.date_joined)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right hidden sm:table-cell">
                                        {normalizeRole(member.role)?.split('_').slice(1).join(' ')}
                                    </TableCell>
                                    {canUpdateMember(member.role, member.user.email as string) && (
                                        <TableCell className="text-right">
                                            <WorkspaceMemberUpdateModal membership={member} />
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            {!hasMembers && <WorkspaceInvitationSendModal workspace={workspace} />}
            {hasMembers && (
                <Tabs defaultValue="all">
                    <div className="flex items-center">
                        <TabsList>
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="admin">Admin</TabsTrigger>
                            <TabsTrigger value="member">Member</TabsTrigger>
                        </TabsList>
                    </div>
                    <TabsContent value="all">{renderTable('All Members', 'All members in the workspace.')}</TabsContent>
                    <TabsContent value="admin">
                        {renderTable('Admins', 'Admins in the workspace.', roleFilters.admin)}
                    </TabsContent>
                    <TabsContent value="member">
                        {renderTable('Members', 'Members in the workspace.', roleFilters.member)}
                    </TabsContent>
                </Tabs>
            )}
        </>
    )
}
