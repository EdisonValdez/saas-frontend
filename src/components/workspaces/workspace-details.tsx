import Link from 'next/link'

import { MoreVertical } from 'lucide-react'

import { formatDateWithTime } from '@/lib/utils'

import { Workspace } from '@/types/workspaces'
import { Subscription } from '@/types/subscriptions'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { WorkspaceDeleteModal } from '@/components/workspaces/workspace-delete-modal'
import { WorkspaceLeaveModal } from '@/components/workspaces/workspace-leave-modal'
import { SubscriptionDetails } from '@/components/subscriptions/details'
import { Separator } from '@/components/ui/separator'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

import { WorkspaceInvitationSendModal } from '@/components/workspaces/workspace-invitation-modal'

import { hasPermission, Role } from '@/lib/roles-permissions'

interface WorkspaceDetailsProps {
    workspace: Workspace
    userRole: Role
}

export function WorkspaceDetails({ workspace, userRole }: WorkspaceDetailsProps) {
    return (
        <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-start bg-muted/50">
                <div className="grid gap-0.5">
                    <CardTitle className="group flex items-center gap-2 text-lg">Details</CardTitle>
                    <CardDescription>
                        <span>Created: {formatDateWithTime(workspace.created_at)} </span>
                        <span>Updated at: {formatDateWithTime(workspace.updated_at)}</span>
                    </CardDescription>
                </div>
                <div className="ml-auto flex items-center gap-1">
                    {userRole === 'WORKSPACE_OWNER' ? (
                        <WorkspaceDeleteModal workspaceId={workspace.id} workspaceName={workspace.name} />
                    ) : (
                        <WorkspaceLeaveModal workspaceId={workspace.id} workspaceName={workspace.name} />
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="outline" className="h-8 w-8">
                                <MoreVertical className="h-3.5 w-3.5" />
                                <span className="sr-only">More</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                                <Link href={`/dashboard/workspaces/${workspace.id}/`}>Home</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Link href={`/dashboard/workspaces/${workspace.id}/teams/`}>Teams</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Link href={`/dashboard/workspaces/${workspace.id}/settings/`}>Settings</Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="p-6 text-sm">
                <div className="grid gap-3">
                    <div className="font-semibold">Workspace Details</div>

                    <ul className="grid gap-3">
                        <li className="flex items-center justify-between">
                            <span className="text-muted-foreground">ID</span>
                            <span>{workspace.id}</span>
                        </li>
                        <li className="flex items-center justify-between">
                            <span className="text-muted-foreground">Name</span>
                            <span>{workspace.name}</span>
                        </li>
                        {workspace.owner && (
                            <li className="flex items-center justify-between">
                                <span className="text-muted-foreground">Creator</span>
                                <span>{workspace.owner.email}</span>
                            </li>
                        )}
                        <li className="flex items-center justify-between">
                            <span className="text-muted-foreground">Status</span>
                            <span>{workspace.status}</span>
                        </li>
                        {workspace.subscription && (
                            <li className="flex items-center justify-between">
                                <span className="text-muted-foreground">Subscription Status</span>
                                <span>{workspace.subscription.status}</span>
                            </li>
                        )}
                        <li className="flex items-center justify-between">
                            <span className="text-muted-foreground">Nr of Members</span>
                            <span>{workspace.members?.length}</span>
                        </li>
                        <li className="flex items-center justify-between">
                            <span className="text-muted-foreground">Nr of Teams</span>
                            <span>{workspace.teams?.length}</span>
                        </li>
                    </ul>
                    <Separator className="my-4" />

                    {userRole && hasPermission(userRole, 'manageSubscription', 'workspace') && (
                        <SubscriptionDetails subscription={workspace.subscription as Subscription} />
                    )}

                    <Separator className="my-2" />

                    {userRole && hasPermission(userRole, 'inviteToWorkspace', 'workspace') && (
                        <WorkspaceInvitationSendModal workspace={workspace} />
                    )}

                    <Separator className="my-2" />

                    {userRole && hasPermission(userRole, 'leaveWorkspace', 'workspace') && (
                        <WorkspaceLeaveModal workspaceId={workspace.id} workspaceName={workspace.name} />
                    )}
                </div>
            </CardContent>
            <CardFooter className="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
                <div className="text-xs text-muted-foreground">
                    Updated <time dateTime="2023-11-23">{formatDateWithTime(workspace.updated_at)}</time>
                </div>
            </CardFooter>
        </Card>
    )
}
