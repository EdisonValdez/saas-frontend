'use client'

import * as React from 'react'

import { useParams } from 'next/navigation'

import { Frame, PieChart, Settings, MessageSquare, Languages, Building2, CreditCard, Presentation } from 'lucide-react'

import { NavMain } from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar'
import { WorkspaceSwitcher } from './workspaces/workspace-switcher-v2'
import { Workspace } from '@/types/workspaces'
import { NavOther } from './nav-other'
import { ThemeToggle } from './theme-toggle'
import { UserDetails } from '@/types/auth'

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    workspaces: Workspace[]
    user: UserDetails
}

export function AppSidebar({ workspaces, user, ...props }: AppSidebarProps) {
    const params = useParams<{ workspaceId: string }>()
    const data = {
        navMain: [
            {
                title: 'Workspace',
                url: `/dashboard/workspaces/${params.workspaceId}`,
                icon: Building2,
                isActive: true,
                items: [
                    {
                        title: 'Home',
                        url: `/dashboard/workspaces/${params.workspaceId}`,
                    },
                    {
                        title: 'Details',
                        url: `/dashboard/workspaces/${params.workspaceId}/details`,
                    },
                    {
                        title: 'Teams',
                        url: `/dashboard/workspaces/${params.workspaceId}/teams`,
                    },
                    {
                        title: 'Settings',
                        url: `/dashboard/workspaces/${params.workspaceId}/settings`,
                    },
                ],
            },
            {
                title: 'Chats',
                url: `/dashboard/workspaces/${params.workspaceId}/chat`,
                icon: MessageSquare,
                items: [
                    {
                        title: 'Chat',
                        url: `/dashboard/workspaces/${params.workspaceId}/chat`,
                    },
                    {
                        title: 'Chat History',
                        url: `/dashboard/workspaces/${params.workspaceId}/chat/history/`,
                    },
                ],
            },
            {
                title: 'Translate',
                url: `/dashboard/workspaces/${params.workspaceId}/translate/`,
                icon: Languages,
                items: [
                    {
                        title: 'Translate with AI',
                        url: `/dashboard/workspaces/${params.workspaceId}/translate/`,
                    },
                ],
            },
        ],
        projects: [
            {
                name: 'Design Engineering',
                url: '#',
                icon: Frame,
            },
            {
                name: 'Sales & Marketing',
                url: '#',
                icon: PieChart,
            },
        ],
        others: [
            {
                name: 'Dashboard',
                url: '/dashboard',
                icon: Frame,
            },
            {
                name: 'Workspaces',
                url: '/dashboard/workspaces',
                icon: Building2,
            },
            {
                name: 'Setttings',
                url: '/dashboard/settings',
                icon: Settings,
            },
            {
                name: 'Billing',
                url: '/dashboard/billing',
                icon: CreditCard,
            },
            {
                name: 'Demos',
                url: '/dashboard/demos',
                icon: Presentation,
            },
        ],
    }

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <WorkspaceSwitcher workspaces={workspaces} />
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
                <NavOther items={data.others} />
            </SidebarContent>
            <SidebarFooter>
                <ThemeToggle />
                <NavUser user={user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
