import { redirect } from 'next/navigation'

import { dashboardConfig } from '@/config/dashboard'

import { UserDetails } from '@/types/auth'
import { Workspace } from '@/types/workspaces'

import { signIn } from '@/lib/auth'
import { getCurrentUserServer } from '@/lib/session'
import { getUserWorkspaces } from '@/lib/user-workspaces'

import { WorkspaceListV2 } from '@/components/workspaces/workspace-list-v2'
import { SimplifiedFeatureNavigation } from '@/components/dashboard/simplified-feature-navigation'

export const metadata = {
    title: 'Dashboard',
    description:
        'Promptax Dashboard - Your AI-powered tax workflow assistant. Manage documents, clients, and AI automation.',
}

export default async function DashboardPage() {
    const userData = (await getCurrentUserServer()) as UserDetails
    const workspacesData = (await getUserWorkspaces()) as Workspace[]

    const [user, workspaces] = await Promise.all([userData, workspacesData])

    if (!user) {
        redirect(await signIn())
    }

    // Get the first workspace ID or use a default value
    const defaultWorkspaceId = workspaces && workspaces.length > 0 ? workspaces[0].id : null

    return (
        <div className="flex flex-1 flex-col gap-8 p-6">
            {/* Header */}
            <div className="border-b border-gray-200 pb-6">
                <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
                <p className="text-gray-600 mt-2">Access your tax professional tools and manage your workspace</p>
            </div>

            {/* Simplified Feature Navigation */}
            <SimplifiedFeatureNavigation workspaceId={defaultWorkspaceId} />

            {/* Workspace Management - Simplified */}
            {workspaces && workspaces.length > 0 ? (
                <div>
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">Your Workspaces</h2>
                        <p className="text-gray-600 mt-1">Team collaboration spaces</p>
                    </div>
                    <WorkspaceListV2 workspaces={workspaces} />
                </div>
            ) : (
                <div className="text-center py-12">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">No Workspaces Found</h2>
                    <p className="text-gray-600 mb-4">Create your first workspace to get started</p>
                    <a href="/dashboard/workspaces" className="text-blue-600 hover:text-blue-800 underline">
                        Create Workspace
                    </a>
                </div>
            )}
        </div>
    )
}
