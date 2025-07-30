import { redirect } from 'next/navigation'

import { dashboardConfig } from '@/config/dashboard'

import { UserDetails } from '@/types/auth'
import { Workspace } from '@/types/workspaces'

import { signIn } from '@/lib/auth'
import { getCurrentUserServer } from '@/lib/session'
import { getUserWorkspaces } from '@/lib/user-workspaces'

import { WorkspaceListV2 } from '@/components/workspaces/workspace-list-v2'
import { DashboardMainNav } from '@/components/dashboard/main-nav'
import { FeatureNavigation } from '@/components/dashboard/feature-navigation'

export const metadata = {
    title: 'Dashboard',
    description: 'Application dashboard',
}

export default async function DashboardPage() {
    const userData = (await getCurrentUserServer()) as UserDetails
    const workspacesData = (await getUserWorkspaces()) as Workspace[]

    const [user, workspaces] = await Promise.all([userData, workspacesData])

    if (!user) {
        redirect(await signIn())
    }

    if (!workspaces) {
        redirect('/dashboard')
    }

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
            <DashboardMainNav items={dashboardConfig.mainNav} workspaces={workspaces} user={user} />

            {/* Feature Navigation - Core SaaS functionality */}
            <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                    <h1 className="text-3xl font-bold text-gray-900">Welcome to Your Dashboard</h1>
                    <p className="text-gray-600 mt-2">
                        Access all your tax professional tools and manage your workspace efficiently
                    </p>
                </div>

                <FeatureNavigation workspaceId={workspaces?.[0]?.id} />
            </div>

            {/* Workspace Management */}
            <div className="mt-8">
                <div className="border-b border-gray-200 pb-4 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Your Workspaces</h2>
                    <p className="text-gray-600 mt-1">Manage and access your workspaces for team collaboration</p>
                </div>
                <WorkspaceListV2 workspaces={workspaces} />
            </div>
        </div>
    )
}
