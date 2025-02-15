// components/teams/team-details.tsx
'use client'

import Link from 'next/link'
import { MoreVertical } from 'lucide-react'

import { formatDateWithTime } from '@/lib/utils'
import { Team, Workspace } from '@/types/workspaces'
import { TeamLeaveModal } from './team-leave-modal'
import { TeamDeleteModal } from './team-delete-modal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { hasPermission, Role } from '@/lib/roles-permissions' // Permission utility

interface TeamDetailsProps {
    team: Team
    workspace: Workspace
    userWorkspaces?: Workspace[]
    userRole: Role // Include userRole for permissions
}

export function TeamDetails({ team, workspace, userRole }: TeamDetailsProps) {
    return (
        <Card className="overflow-hidden" x-chunk="dashboard-05-chunk-4">
            <CardHeader className="flex flex-row items-start bg-muted/50">
                <div className="grid gap-0.5">
                    <CardTitle className="group flex items-center gap-2 text-lg">Team Details</CardTitle>
                    <CardDescription>
                        <span suppressHydrationWarning>Created: {formatDateWithTime(team.created_at)} </span>
                    </CardDescription>
                </div>
                <div className="ml-auto flex items-center gap-1">
                    {hasPermission(userRole, 'leaveTeam', 'team') && (
                        <TeamLeaveModal workspaceId={workspace.id} teamId={team.id} teamName={team.name} />
                    )}
                    {hasPermission(userRole, 'deleteTeam', 'team') && <TeamDeleteModal team={team} />}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="outline" className="h-8 w-8">
                                <MoreVertical className="h-3.5 w-3.5" />
                                <span className="sr-only">More</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                                <Link href={`/dashboard/workspaces/${workspace.id}/`}>Workspace</Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="p-6 text-sm">
                <div className="grid gap-3">
                    <div className="font-semibold">Team Details</div>

                    <ul className="grid gap-3">
                        <li className="flex items-center justify-between">
                            <span className="text-muted-foreground">ID</span>
                            <span>{team.id}</span>
                        </li>
                        <li className="flex items-center justify-between">
                            <span className="text-muted-foreground">Name</span>
                            <span>{team.name}</span>
                        </li>
                        {team.owner && (
                            <li className="flex items-center justify-between">
                                <span className="text-muted-foreground">Creator</span>
                                <span>{team.owner.email}</span>
                            </li>
                        )}
                        <li className="flex items-center justify-between">
                            <span className="text-muted-foreground">Workspace Status</span>
                            <span>{workspace.status}</span>
                        </li>
                        {workspace.subscription && (
                            <li className="flex items-center justify-between">
                                <span className="text-muted-foreground">Workspace Subscription Status</span>
                                <span>{workspace.subscription.status}</span>
                            </li>
                        )}
                        <li className="flex items-center justify-between">
                            <span className="text-muted-foreground">Status</span>
                            <span>{workspace.status}</span>
                        </li>
                        <li className="flex items-center justify-between">
                            <span className="text-muted-foreground">Nr of Members</span>
                            <span>{team.members?.length}</span>
                        </li>
                        <li className="flex items-center justify-between">
                            <span className="text-muted-foreground">Nr of Invitations</span>
                            <span>{team.invitations?.length}</span>
                        </li>
                    </ul>
                    <Separator className="my-4" />
                </div>
            </CardContent>
            <CardFooter className="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
                <div className="text-xs text-muted-foreground">
                    Updated{' '}
                    <time suppressHydrationWarning dateTime="2023-11-23">
                        {formatDateWithTime(workspace.updated_at)}
                    </time>
                </div>
            </CardFooter>
        </Card>
    )
}
