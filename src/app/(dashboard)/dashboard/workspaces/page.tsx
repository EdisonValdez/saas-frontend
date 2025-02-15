import { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { UserDetails } from '@/types/auth'
import { Workspace } from '@/types/workspaces'

import { signIn } from '@/lib/auth'
import { getCurrentUserServer } from '@/lib/session'
import { getUserWorkspaces } from '@/lib/user-workspaces'

import { WorkspaceListV2 } from '@/components/workspaces/workspace-list-v2'
import { DashboardMainNav } from '@/components/dashboard/main-nav'
import { dashboardConfig } from '@/config/dashboard'

export const metadata: Metadata = {
    title: 'Your Workspaces',
    description: 'Your workspaces.',
}

export default async function WorspacesPage() {
    const userData = (await getCurrentUserServer()) as UserDetails
    const workspacesData = (await getUserWorkspaces()) as Workspace[]

    const [user, workspaces] = await Promise.all([userData, workspacesData])

    if (!user) {
        redirect(await signIn())
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <DashboardMainNav items={dashboardConfig.mainNav} workspaces={workspaces} user={user} />
            <WorkspaceListV2 workspaces={workspaces} />
        </div>
    )
}
