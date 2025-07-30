import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import { signIn } from '@/lib/auth'

import { getCurrentUserServer } from '@/lib/session'
import { getUserWorkspaces } from '@/lib/user-workspaces'
import { UserDetails } from '@/types/auth'
import { Workspace } from '@/types/workspaces'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'

export const metadata: Metadata = {
    title: 'Dashboard',
    description: 'Your app dashboard',
}

interface DashboardLayoutProps {
    children?: React.ReactNode
}

export default async function Dashboard({ children }: DashboardLayoutProps) {
    const userData = (await getCurrentUserServer()) as UserDetails
    const workspacesData = (await getUserWorkspaces()) as Workspace[]

    const [user, workspaces] = await Promise.all([userData, workspacesData])

    if (!user) {
        redirect(await signIn('/dashboard'))
    }

    const firstWorkspaceId = workspaces?.[0]?.id

    return (
        <div className="flex min-h-screen w-full">
            <DashboardSidebar workspaceId={firstWorkspaceId} />
            <div className="flex-1 flex flex-col">
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
