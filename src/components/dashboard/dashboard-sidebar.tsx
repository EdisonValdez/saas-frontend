'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Home,
    Users,
    MessageSquare,
    FileText,
    Settings,
    CreditCard,
    Building2,
    BarChart3,
    Bot,
    FormInput,
    Upload,
    Languages,
    UserPlus,
    Presentation,
    HelpCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface DashboardSidebarProps {
    workspaceId?: string
    className?: string
}

const coreNavItems = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: Home,
        description: 'Overview & quick access',
    },
    {
        title: 'Workspaces',
        href: '/dashboard/workspaces',
        icon: Building2,
        description: 'Manage workspaces',
    },
    {
        title: 'Settings',
        href: '/dashboard/settings',
        icon: Settings,
        description: 'Account preferences',
    },
    {
        title: 'Billing',
        href: '/dashboard/billing',
        icon: CreditCard,
        description: 'Subscription & billing',
    },
]

const featureNavItems = [
    {
        title: 'Document Management',
        href: '/document-upload-demo',
        icon: FileText,
        description: 'Upload & manage documents',
    },
    {
        title: 'Client Management',
        href: '/client-management-demo',
        icon: Users,
        description: 'Manage client profiles',
    },
    {
        title: 'AI Tax Assistant',
        href: '/tax-assistant-chat-demo',
        icon: Bot,
        description: 'Chat with AI assistant',
    },
    {
        title: 'Forms & Workflows',
        href: '/form-selection-demo',
        icon: FormInput,
        description: 'Tax forms & generation',
    },
]

const demoNavItems = [
    {
        title: 'All Demos',
        href: '/dashboard/demos',
        icon: Presentation,
        description: 'View all demo pages',
    },
]

export function DashboardSidebar({ workspaceId, className }: DashboardSidebarProps) {
    const pathname = usePathname()

    const workspaceNavItems = workspaceId
        ? [
              {
                  title: 'Workspace Chat',
                  href: `/dashboard/workspaces/${workspaceId}/chat`,
                  icon: MessageSquare,
                  description: 'Team collaboration',
              },
              {
                  title: 'Team Management',
                  href: `/dashboard/workspaces/${workspaceId}/teams`,
                  icon: UserPlus,
                  description: 'Manage team members',
              },
              {
                  title: 'Translation Tools',
                  href: `/dashboard/workspaces/${workspaceId}/translate`,
                  icon: Languages,
                  description: 'Document translation',
              },
          ]
        : []

    const renderNavSection = (title: string, items: typeof coreNavItems) => (
        <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 px-3">{title}</h4>
            <div className="space-y-1">
                {items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                    const Icon = item.icon

                    return (
                        <Link key={item.href} href={item.href}>
                            <Button
                                variant={isActive ? 'secondary' : 'ghost'}
                                className={cn(
                                    'w-full justify-start h-auto py-3 px-3',
                                    isActive && 'bg-blue-50 text-blue-700 border-blue-200'
                                )}
                            >
                                <Icon className="mr-3 h-4 w-4 flex-shrink-0" />
                                <div className="text-left flex-1 min-w-0">
                                    <div className="font-medium text-sm truncate">{item.title}</div>
                                    <div className="text-xs text-gray-500 truncate">{item.description}</div>
                                </div>
                            </Button>
                        </Link>
                    )
                })}
            </div>
        </div>
    )

    return (
        <div className={cn('w-64 bg-white border-r border-gray-200 flex flex-col', className)}>
            <div className="flex-1 flex flex-col">
                <div className="p-4">
                    <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
                    <p className="text-sm text-gray-600">Quick access to all features</p>
                </div>

                <ScrollArea className="flex-1 px-3">
                    <div className="space-y-6 pb-6">
                        {/* Core Navigation */}
                        {renderNavSection('Core', coreNavItems)}

                        <Separator />

                        {/* Feature Navigation */}
                        {renderNavSection('Features', featureNavItems)}

                        {workspaceNavItems.length > 0 && (
                            <>
                                <Separator />
                                {renderNavSection('Workspace', workspaceNavItems)}
                            </>
                        )}

                        <Separator />

                        {/* Demo Navigation */}
                        {renderNavSection('Demos', demoNavItems)}
                    </div>
                </ScrollArea>

                <div className="p-4 border-t border-gray-200">
                    <Link href="/dashboard/demos">
                        <Button variant="outline" className="w-full justify-start">
                            <HelpCircle className="mr-2 h-4 w-4" />
                            View All Demos
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
