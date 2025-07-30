import { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { signIn } from '@/lib/auth'
import { getCurrentUserServer } from '@/lib/session'
import { getUserWorkspaces } from '@/lib/user-workspaces'
import { Workspace } from '@/types/workspaces'
import { ClientManagementDashboard } from '@/components/clients/client-management-dashboard'

export const metadata: Metadata = {
    title: 'Client Management',
    description: 'Manage your clients, profiles, and subscription limits',
}

export default async function ClientManagementPage(props: { params: Promise<{ workspaceId: string }> }) {
    const params = await props.params
    const user = await getCurrentUserServer()

    if (!user) {
        redirect(await signIn())
    }

    const workspaces = await getUserWorkspaces()
    const workspace = workspaces?.find((w) => w.id === params.workspaceId) as Workspace

    if (!workspace) {
        redirect('/dashboard')
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <ClientManagementDashboard workspace={workspace} />
        </div>
    )
}
