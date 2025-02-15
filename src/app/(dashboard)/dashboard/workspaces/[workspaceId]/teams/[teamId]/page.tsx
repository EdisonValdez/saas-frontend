import { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { Workspace } from '@/types/workspaces'
import { fetchTeam } from '@/lib/team-details'
import { getUserWorkspaces } from '@/lib/user-workspaces'
import { fetchWorkspace } from '@/lib/workspace-details'
import { getCurrentUserServer } from '@/lib/session'
import { signIn } from '@/lib/auth'

import { TeamDetails } from '@/components/teams/team-details'
import { TeamUpdateForm } from '@/components/teams/team-update-form'
import { TeamInvitationCreateForm } from '@/components/teams/invitation-create'
import { TeamInvitationsList } from '@/components/teams/team-invitations-list'
import { TeamMembersList } from '@/components/teams/team-members-list'
import { determineUserRole, hasPermission } from '@/lib/roles-permissions'

export const metadata: Metadata = {
    title: 'Team Details',
    description: 'Check and update the details of the team.',
}

export default async function TeamDetailsPage(props: { params: Promise<{ workspaceId: string; teamId: string }> }) {
    const params = await props.params

    // Step 1: Get the current user
    const user = await getCurrentUserServer()

    // Step 2: Redirect to sign-in if the user is not authenticated
    if (!user) {
        redirect(await signIn())
    }

    try {
        // Step 3: Fetch necessary data concurrently
        const [team, workspace, workspaces] = await Promise.all([
            fetchTeam(params.teamId),
            fetchWorkspace(params.workspaceId),
            getUserWorkspaces(),
        ])

        // Step 4: Validate fetched data
        if (!workspace) {
            throw new Error('Workspace not found.')
        }

        if (!team) {
            throw new Error('Team not found.')
        }

        if (!workspaces) {
            throw new Error('User workspaces not found.')
        }

        // Step 4: Determine user role within the workspace
        const userRole = determineUserRole(user, workspace, team)

        // Step 5: Render the page content
        return (
            <main className="grid flex-1 items-start gap-6 p-6 sm:px-6 sm:py-0 md:gap-6 lg:grid-cols-3 xl:grid-cols-3">
                <div className="grid gap-6 lg:col-span-2">
                    {/* Forms side by side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {userRole && hasPermission(userRole, 'updateTeam', 'team') && (
                            <TeamUpdateForm
                                team={team}
                                userWorkspaces={workspaces as Workspace[]}
                                workspace={workspace}
                            />
                        )}
                        {userRole && hasPermission(userRole, 'inviteToTeam', 'team') && (
                            <TeamInvitationCreateForm team={team} />
                        )}
                    </div>

                    {/* Team Members List spans full width */}
                    <div className="w-full">
                        {userRole && hasPermission(userRole, 'listTeamMembers', 'team') && (
                            <TeamMembersList team={team} />
                        )}
                    </div>

                    {/* Team Invitations List below members */}
                    <div className="w-full">
                        {userRole && hasPermission(userRole, 'viewTeamInvitations', 'team') && (
                            <TeamInvitationsList team={team} user={user} workspace={workspace} />
                        )}
                    </div>
                </div>

                {/* Sidebar with team details */}
                <aside className="lg:col-span-1">
                    {userRole && hasPermission(userRole, 'viewTeamDetails', 'team') && (
                        <TeamDetails
                            team={team}
                            workspace={workspace}
                            userWorkspaces={workspaces as Workspace[]}
                            userRole={userRole}
                        />
                    )}
                </aside>
            </main>
        )
    } catch (error) {
        // Step 6: Handle any errors
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
