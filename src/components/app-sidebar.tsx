'use client'

import * as React from 'react'

import { useParams, usePathname } from 'next/navigation'

import { Frame, PieChart, Settings, MessageSquare, Languages, Building2, CreditCard, Presentation, Mail, Users, FileText, Calculator } from 'lucide-react'

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
    const pathname = usePathname()
    const currentWorkspaceId = params.workspaceId || workspaces?.[0]?.id || 'default'

    // Check if we're currently in a workspace-specific page
    const isInWorkspace = pathname.startsWith(`/dashboard/workspaces/${currentWorkspaceId}`)

    const data = {
        navMain: [
            {
                title: 'Workspace',
                url: `/dashboard/workspaces/${currentWorkspaceId}`,
                icon: Building2,
                isActive: isInWorkspace,
                items: [
                    {
                        title: 'Home',
                        url: `/dashboard/workspaces/${currentWorkspaceId}`,
                    },
                    {
                        title: 'Details',
                        url: `/dashboard/workspaces/${currentWorkspaceId}/details`,
                    },
                    {
                        title: 'Teams',
                        url: `/dashboard/workspaces/${currentWorkspaceId}/teams`,
                    },
                    {
                        title: 'Clients',
                        url: `/dashboard/workspaces/${currentWorkspaceId}/clients`,
                        icon: Users,
                    },
                    {
                        title: 'Documents',
                        url: `/dashboard/workspaces/${currentWorkspaceId}/documents`,
                        icon: FileText,
                    },
                    {
                        title: 'Tax Forms',
                        url: `/dashboard/workspaces/${currentWorkspaceId}/forms`,
                        icon: Calculator,
                    },
                    {
                        title: 'Tax Assistant',
                        url: `/dashboard/workspaces/${currentWorkspaceId}/chat-agent`,
                        icon: MessageSquare,
                    },
                    {
                        title: 'Email Agent',
                        url: `/dashboard/workspaces/${currentWorkspaceId}/email-agent`,
                        icon: Mail,
                    },
                    {
                        title: 'Settings',
                        url: `/dashboard/workspaces/${currentWorkspaceId}/settings`,
                    },
                ],
            },
            {
                title: 'Chats',
                url: `/dashboard/workspaces/${currentWorkspaceId}/chat`,
                icon: MessageSquare,
                items: [
                    {
                        title: 'Chat',
                        url: `/dashboard/workspaces/${currentWorkspaceId}/chat`,
                    },
                    {
                        title: 'Chat History',
                        url: `/dashboard/workspaces/${currentWorkspaceId}/chat/history/`,
                    },
                ],
            },
            {
                title: 'Translate',
                url: `/dashboard/workspaces/${currentWorkspaceId}/translate/`,
                icon: Languages,
                items: [
                    {
                        title: 'Translate with AI',
                        url: `/dashboard/workspaces/${currentWorkspaceId}/translate/`,
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
                name: 'Settings',
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
