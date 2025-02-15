import { DashboardConfig } from '@/types/nav'

export const dashboardConfig: DashboardConfig = {
    mainNav: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Workspaces',
            href: '/dashboard/workspaces',
        },
        {
            title: 'Settings',
            href: '/dashboard/settings',
        },
        {
            title: 'Billing',
            href: '/dashboard/billing',
        },
    ],
    sidebarNav: [
        {
            title: 'Workspace Home',
            href: '/',
            icon: 'home',
        },
        {
            title: 'Details',
            href: '/details',
            icon: 'microscope',
        },
        {
            title: 'Settings',
            href: '/settings',
            icon: 'settings',
        },
        {
            title: 'Teams',
            href: '/teams',
            icon: 'users',
        },
        {
            title: "Workspace's Chat",
            href: '/chat',
            icon: 'messagesSquare',
        },
        {
            title: 'Chat Sessions',
            href: '/chat-sessions',
            icon: 'list',
        },
    ],
}
