import { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { Invitation, Workspace } from '@/types/workspaces'

import { signIn } from '@/lib/auth'
import { getCurrentUserServer } from '@/lib/session'
import { getUserWorkspaces } from '@/lib/user-workspaces'
import { getWorkspaceInvitations } from '@/lib/workspace-invitations'

import { WorkspaceDetails } from '@/components/workspaces/workspace-details'
import { WorkspaceUpdateForm } from '@/components/workspaces/workspace-update-form'
import { TeamCreateForm } from '@/components/teams/team-create'
import { WorkspaceMembersList } from '@/components/workspaces/workspace-member-list'
import { WorkspaceInvitationsList } from '@/components/workspaces/workspace-invitations-list'
import { determineUserRole } from '@/lib/roles-permissions'

import { hasPermission } from '@/lib/roles-permissions'

export const metadata: Metadata = {
    title: 'Workspace Details',
    description: 'Details of the workspace.',
}

export default async function WorkspaceDetailsPage(props: { params: Promise<{ workspaceId: string }> }) {
    const params = await props.params

    // Step 1: Fetch the current user
    const user = await getCurrentUserServer()

    // Step 2: Redirect if not authenticated
    if (!user) {
        redirect(await signIn(`/dashboard/workspaces/${params.workspaceId}/details`))
    }

    try {
        // Step 3: Fetch user workspaces and find the requested workspace
        const userWorkspaces = await getUserWorkspaces()
        const workspace = userWorkspaces?.find((w) => w.id === params.workspaceId)

        if (!workspace) {
            throw new Error('Workspace not found.')
        }

        // Determine user role
        const userRole = determineUserRole(user, workspace)

        // Fetch invitations only if the user has permission
        let workspaceInvitations: Invitation[] = []

        if (userRole && hasPermission(userRole, 'viewInvitations', 'workspace')) {
            workspaceInvitations = (await getWorkspaceInvitations(workspace.id)) || []
        }

        // Step 4: Render the page content
        return (
            <main className="grid flex-1 items-start gap-8 p-4 sm:px-6 lg:grid-cols-3 lg:gap-12">
                {/* Left Column - Workspace Details */}
                <div className="lg:col-span-1 lg:order-first order-last">
                    {userRole && hasPermission(userRole, 'viewWorkspaceDetails', 'workspace') && (
                        <WorkspaceDetails workspace={workspace as Workspace} userRole={userRole} />
                    )}
                </div>

                {/* Center Column - Main Content */}
                <div className="grid auto-rows-max gap-8 lg:col-span-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        {userRole && hasPermission(userRole, 'updateWorkspace', 'workspace') && (
                            <WorkspaceUpdateForm workspace={workspace} />
                        )}
                        {userRole && hasPermission(userRole, 'createTeam', 'team') && (
                            <TeamCreateForm workspace={workspace} />
                        )}
                    </div>

                    {/* Workspace Members and Invitations */}
                    <div className="lg:grid gap-8">
                        {userRole && hasPermission(userRole, 'listWorkspaceMembers', 'workspace') && (
                            <WorkspaceMembersList workspace={workspace} userRole={userRole} />
                        )}
                        {userRole && hasPermission(userRole, 'viewInvitations', 'workspace') && (
                            <WorkspaceInvitationsList
                                invitations={workspaceInvitations}
                                user={user}
                                workspace={workspace}
                            />
                        )}
                    </div>
                </div>
            </main>
        )
    } catch (error) {
        // Step 5: Render error message
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-3xl font-bold">Error</h1>
                    <p className="text-lg">{(error as Error).message}</p>
                </div>
            </div>
        )
    }
}
