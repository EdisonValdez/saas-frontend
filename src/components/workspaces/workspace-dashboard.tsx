'use client'

import React from 'react'
import Link from 'next/link'
import {
    MessageSquare,
    Users,
    Settings,
    Languages,
    FileText,
    Upload,
    Bot,
    History,
    UserPlus,
    Calendar,
    BarChart3,
    Archive,
    ExternalLink,
    Zap,
    Shield,
    Share2,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Workspace } from '@/types/workspaces'

interface WorkspaceDashboardProps {
    workspace: Workspace
}

export function WorkspaceDashboard({ workspace }: WorkspaceDashboardProps) {
    const workspaceFeatures = [
        {
            title: 'Workspace Chat',
            description: 'Collaborate with team members in real-time',
            icon: <MessageSquare className="w-6 h-6" />,
            href: `/dashboard/workspaces/${workspace.id}/chat`,
            color: 'bg-blue-50 text-blue-600 border-blue-200',
            category: 'Communication',
            actions: [
                { label: 'Start New Chat', href: `/dashboard/workspaces/${workspace.id}/chat` },
                { label: 'View Chat History', href: `/dashboard/workspaces/${workspace.id}/chat/history` },
            ],
        },
        {
            title: 'Tax Assistant',
            description: 'AI-powered tax consultation and advice sessions',
            icon: <Bot className="w-6 h-6" />,
            href: `/dashboard/workspaces/${workspace.id}/tax-assistant`,
            color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
            category: 'AI Tools',
            actions: [
                { label: 'New Tax Session', href: `/dashboard/workspaces/${workspace.id}/tax-assistant` },
                { label: 'View All Sessions', href: `/dashboard/workspaces/${workspace.id}/tax-assistant` },
            ],
        },
        {
            title: 'Email Agent',
            description: 'Professional email composition with AI assistance',
            icon: <ExternalLink className="w-6 h-6" />,
            href: `/dashboard/workspaces/${workspace.id}/email-agent`,
            color: 'bg-violet-50 text-violet-600 border-violet-200',
            category: 'AI Tools',
            actions: [
                { label: 'New Email Session', href: `/dashboard/workspaces/${workspace.id}/email-agent` },
                { label: 'View All Sessions', href: `/dashboard/workspaces/${workspace.id}/email-agent` },
            ],
        },
        {
            title: 'Team Management',
            description: 'Manage team members, roles, and permissions',
            icon: <Users className="w-6 h-6" />,
            href: `/dashboard/workspaces/${workspace.id}/teams`,
            color: 'bg-purple-50 text-purple-600 border-purple-200',
            category: 'Team',
            actions: [
                { label: 'View Teams', href: `/dashboard/workspaces/${workspace.id}/teams` },
                { label: 'Invite Members', href: `/dashboard/workspaces/${workspace.id}/teams` },
            ],
        },
        {
            title: 'Document Translation',
            description: 'Translate documents for international clients',
            icon: <Languages className="w-6 h-6" />,
            href: `/dashboard/workspaces/${workspace.id}/translate`,
            color: 'bg-green-50 text-green-600 border-green-200',
            category: 'Tools',
            actions: [{ label: 'Translate Document', href: `/dashboard/workspaces/${workspace.id}/translate` }],
        },
        {
            title: 'Workspace Settings',
            description: 'Configure workspace preferences and integrations',
            icon: <Settings className="w-6 h-6" />,
            href: `/dashboard/workspaces/${workspace.id}/settings`,
            color: 'bg-gray-50 text-gray-600 border-gray-200',
            category: 'Settings',
            actions: [
                { label: 'General Settings', href: `/dashboard/workspaces/${workspace.id}/settings` },
                { label: 'Workspace Details', href: `/dashboard/workspaces/${workspace.id}/details` },
            ],
        },
    ]

    const globalFeatures = [
        {
            title: 'Document Upload',
            description: 'Upload and process new tax documents',
            icon: <Upload className="w-5 h-5" />,
            href: '/document-upload-demo',
            color: 'text-blue-600',
        },
        {
            title: 'AI Tax Assistant',
            description: 'Get help with tax questions',
            icon: <Bot className="w-5 h-5" />,
            href: '/tax-assistant-chat-demo',
            color: 'text-green-600',
        },
        {
            title: 'Client Management',
            description: 'Manage client profiles',
            icon: <Users className="w-5 h-5" />,
            href: '/client-management-demo',
            color: 'text-purple-600',
        },
        {
            title: 'Form Generation',
            description: 'Generate and process forms',
            icon: <FileText className="w-5 h-5" />,
            href: '/form-generation-workflow-demo',
            color: 'text-orange-600',
        },
    ]

    const quickActions = [
        {
            label: 'Share Workspace Link',
            icon: <Share2 className="w-4 h-4" />,
            href: `/chats/${workspace.id}/shared-link`,
            description: 'Share this workspace with external users',
        },
        {
            label: 'Archive Workspace',
            icon: <Archive className="w-4 h-4" />,
            href: `/dashboard/workspaces/${workspace.id}/settings`,
            description: 'Archive this workspace',
        },
        {
            label: 'View All Workspaces',
            icon: <ExternalLink className="w-4 h-4" />,
            href: '/dashboard/workspaces',
            description: 'Return to workspace overview',
        },
    ]

    return (
        <div className="space-y-8">
            {/* Workspace Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                            <h1 className="text-3xl font-bold text-gray-900">{workspace.name}</h1>
                            <Badge variant={workspace.status === 'active' ? 'default' : 'secondary'}>
                                {workspace.status}
                            </Badge>
                        </div>
                        <p className="text-gray-600 mb-4">
                            Workspace ID: {workspace.id} • Owner: {workspace.owner.email}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                                <Shield className="w-4 h-4" />
                                <span>Secure Workspace</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <Zap className="w-4 h-4" />
                                <span>Real-time Collaboration</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Button asChild variant="outline">
                            <Link href={`/dashboard/workspaces/${workspace.id}/settings`}>
                                <Settings className="w-4 h-4 mr-2" />
                                Settings
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={`/dashboard/workspaces/${workspace.id}/chat`}>
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Open Chat
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Workspace Features */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Workspace Features</h2>
                        <p className="text-gray-600 mt-1">Tools and features specific to this workspace</p>
                    </div>
                    <Badge variant="secondary" className="px-3 py-1">
                        {workspaceFeatures.length} Features
                    </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {workspaceFeatures.map((feature) => (
                        <Card
                            key={feature.title}
                            className={`hover:shadow-lg transition-shadow border-2 ${feature.color}`}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-lg ${feature.color}`}>{feature.icon}</div>
                                        <div>
                                            <CardTitle className="text-lg">{feature.title}</CardTitle>
                                            <CardDescription className="text-sm mt-1">
                                                {feature.description}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                        {feature.category}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="space-y-3">
                                    <Button asChild className="w-full" variant="outline">
                                        <Link href={feature.href}>
                                            <ExternalLink className="w-4 h-4 mr-2" />
                                            Open {feature.title}
                                        </Link>
                                    </Button>

                                    {feature.actions && (
                                        <div className="space-y-2">
                                            <Separator />
                                            <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                                Quick Actions
                                            </div>
                                            <div className="space-y-1">
                                                {feature.actions.map((action) => (
                                                    <Button
                                                        key={action.label}
                                                        asChild
                                                        variant="ghost"
                                                        size="sm"
                                                        className="w-full justify-start h-8 text-xs"
                                                    >
                                                        <Link href={action.href}>
                                                            <Zap className="w-3 h-3 mr-2" />
                                                            {action.label}
                                                        </Link>
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Global Features Quick Access */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Global Features</h2>
                        <p className="text-gray-600 mt-1">Access core platform features and demos</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {globalFeatures.map((feature) => (
                        <Card key={feature.title} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                                <div className="text-center space-y-3">
                                    <div className={`mx-auto p-3 rounded-lg bg-gray-50 w-fit ${feature.color}`}>
                                        {feature.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-sm">{feature.title}</h3>
                                        <p className="text-xs text-gray-500 mt-1">{feature.description}</p>
                                    </div>
                                    <Button asChild size="sm" variant="outline" className="w-full">
                                        <Link href={feature.href}>Access</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                        <p className="text-gray-600 text-sm">Common workspace management tasks</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {quickActions.map((action) => (
                        <Button key={action.label} asChild variant="outline" className="justify-start h-auto p-4">
                            <Link href={action.href}>
                                <div className="flex items-start space-x-3">
                                    {action.icon}
                                    <div className="text-left">
                                        <div className="font-medium text-sm">{action.label}</div>
                                        <div className="text-xs text-gray-500 mt-1">{action.description}</div>
                                    </div>
                                </div>
                            </Link>
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    )
}
