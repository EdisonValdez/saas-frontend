import { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { signIn } from '@/lib/auth'
import { getCurrentUserServer } from '@/lib/session'
import { fetchWorkspace } from '@/lib/workspace-details'

import { WorkspaceTeamList } from '@/components/workspaces/workspace-team-list'
import { TeamCreateModal } from '@/components/workspaces/team-create-modal'
import { determineUserRole, hasPermission } from '@/lib/roles-permissions'

export const metadata: Metadata = {
    title: 'Team List',
    description: 'The teams of the workspace.',
}

export default async function WorkspaceTeamListPage(props: { params: Promise<{ workspaceId: string }> }) {
    const params = await props.params
    const user = await getCurrentUserServer()

    // Step 1: Redirect to sign-in if the user is not authenticated
    if (!user) {
        redirect(await signIn())
    }

    // Step 2: Fetch the workspace details
    const workspace = await fetchWorkspace(params.workspaceId)

    // Step 3: Redirect to dashboard if workspace not found
    if (!workspace) {
        redirect('/dashboard')
    }

    // Step 4: Determine user role within the workspace
    const userRole = determineUserRole(user, workspace)

    return (
        <main className="p-4 sm:px-6 sm:py-0 md:gap-8">
            <div className="flex-1 space-y-4 p-2 pt-3">
                <div className="flex items-center justify-between space-y-2">
                    <p className="text-3xl font-bold tracking-tight">{`Teams of ${workspace?.name}`}</p>

                    {/* Show TeamCreateModal only if the user has 'createTeam' permission */}
                    <div className="flex items-center space-x-2">
                        {userRole && hasPermission(userRole, 'createTeam', 'team') && (
                            <TeamCreateModal workspace={workspace} />
                        )}
                    </div>
                </div>
            </div>

            {/* Display WorkspaceTeamList only if the user has 'viewTeams' permission */}
            {workspace && userRole && hasPermission(userRole, 'viewTeams', 'workspace') ? (
                <div>
                    <WorkspaceTeamList workspace={workspace} userRole={userRole} />
                </div>
            ) : (
                <p className="text-muted text-sm">You do not have permission to view the teams in this workspace.</p>
            )}
        </main>
    )
}
