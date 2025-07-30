import { redirect } from 'next/navigation'

import { getUserWorkspaces } from '@/lib/user-workspaces'
import { getCurrentUserServer } from '@/lib/session'
import { signIn } from '@/lib/auth'

import { DynamicBreadcrumb } from '@/components/dynamic-breadcrumb'
import { AppSidebar } from '@/components/app-sidebar'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { UserDetails } from '@/types/auth'
import { Workspace } from '@/types/workspaces'

interface DemosLayoutProps {
    children: React.ReactNode
}

export default async function DemosLayout({ children }: DemosLayoutProps) {
    const userData = getCurrentUserServer()
    const workspacesData = getUserWorkspaces()

    const [user, workspaces] = await Promise.all([userData, workspacesData])

    if (!user) {
        redirect(await signIn())
    }

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
                <div className="p-4">{children}</div>
            </SidebarInset>
        </SidebarProvider>
    )
}
