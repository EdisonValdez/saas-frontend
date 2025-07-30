import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import { signIn } from '@/lib/auth'

import { getCurrentUserServer } from '@/lib/session'
import { getUserWorkspaces } from '@/lib/user-workspaces'
import { UserDetails } from '@/types/auth'
import { Workspace } from '@/types/workspaces'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { DynamicBreadcrumb } from '@/components/dynamic-breadcrumb'

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
        <SidebarProvider>
            <AppSidebar workspaces={workspaces as Workspace[]} user={user as UserDetails} />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <DynamicBreadcrumb />
                    </div>
                </header>
                <div className="flex-1 overflow-auto p-4">{children}</div>
            </SidebarInset>
        </SidebarProvider>
    )
}
