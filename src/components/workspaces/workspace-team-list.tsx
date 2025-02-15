import Link from 'next/link'
import { Workspace } from '@/types/workspaces'
import { hasPermission, Role } from '@/lib/roles-permissions'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { TeamDeleteModal } from '@/components/teams/team-delete-modal'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface WorkspaceTeamListProps {
    workspace: Workspace
    userRole: Role
}

export function WorkspaceTeamList({ workspace, userRole }: WorkspaceTeamListProps) {
    if (!workspace) return null

    const hasTeams = (workspace && workspace.teams && workspace.teams?.length > 0) || false
    const canDeleteTeams = hasPermission(userRole, 'deleteTeam', 'workspace')

    return (
        <>
            {!hasTeams ? (
                <Card>
                    <CardHeader className="px-7">
                        <CardTitle>No Teams</CardTitle>
                        <CardDescription>This workspace has no teams yet.</CardDescription>
                    </CardHeader>
                </Card>
            ) : (
                <Tabs defaultValue="all">
                    <div className="flex items-center">
                        <TabsList>
                            <TabsTrigger value="all">All Teams</TabsTrigger>
                        </TabsList>
                    </div>
                    <TabsContent value="all">
                        <Card>
                            <CardHeader className="px-7">
                                <CardTitle>{workspace.name} Teams</CardTitle>
                                <CardDescription>Teams of the workspace.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead className="text-right hidden sm:table-cell">
                                                Creator Email
                                            </TableHead>
                                            <TableHead className="text-right">Details</TableHead>
                                            {canDeleteTeams && <TableHead className="text-right">Delete</TableHead>}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {workspace &&
                                            workspace.teams &&
                                            workspace.teams.map((team) => (
                                                <TableRow key={team.id}>
                                                    <TableCell>
                                                        <div className="font-medium">{team.name}</div>
                                                    </TableCell>
                                                    <TableCell className="text-right hidden sm:table-cell">
                                                        {team.owner.email}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Link
                                                            href={`/dashboard/workspaces/${workspace.id}/teams/${team.id}`}
                                                        >
                                                            <Button variant="default">Details</Button>
                                                        </Link>
                                                    </TableCell>
                                                    {canDeleteTeams && (
                                                        <TableCell className="text-right">
                                                            <TeamDeleteModal team={team} />
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            )}
        </>
    )
}
