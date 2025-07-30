'use client'

import React from 'react'
import Link from 'next/link'
import { 
    FileText, 
    Users, 
    MessageSquare, 
    Upload, 
    Settings, 
    FolderOpen,
    CreditCard,
    PlusCircle,
    BarChart3,
    Bot,
    Languages,
    UserPlus,
    FileSearch,
    FormInput,
    Calendar,
    Archive,
    Eye,
    Workflow
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface FeatureNavigationProps {
    workspaceId?: string
}

export function FeatureNavigation({ workspaceId }: FeatureNavigationProps) {
    const coreFeatures = [
        {
            title: 'Document Management',
            description: 'Upload, process, and manage tax documents with AI extraction',
            icon: <FileText className="w-6 h-6" />,
            href: workspaceId ? `/dashboard/workspaces/${workspaceId}` : '/document-upload-demo',
            color: 'bg-blue-50 text-blue-600 border-blue-200',
            actions: [
                { label: 'Upload Documents', href: '/document-upload-demo' },
                { label: 'Manage Documents', href: '/document-management-demo' },
                { label: 'Extract Data', href: '/document-extraction-demo' },
                { label: 'Review Data', href: '/extracted-data-review-demo' }
            ]
        },
        {
            title: 'Client Management',
            description: 'Manage client profiles, contacts, and relationships',
            icon: <Users className="w-6 h-6" />,
            href: '/client-management-demo',
            color: 'bg-purple-50 text-purple-600 border-purple-200',
            actions: [
                { label: 'Client Database', href: '/client-management-demo' },
                { label: 'Client Onboarding', href: '/client-onboarding-demo' },
                { label: 'Add New Client', href: '/client-management-demo' }
            ]
        },
        {
            title: 'AI Tax Assistant',
            description: 'Chat with AI assistant for tax questions and document analysis',
            icon: <Bot className="w-6 h-6" />,
            href: '/tax-assistant-chat-demo',
            color: 'bg-green-50 text-green-600 border-green-200',
            actions: [
                { label: 'Start Chat', href: '/tax-assistant-chat-demo' },
                { label: 'Chat History', href: workspaceId ? `/dashboard/workspaces/${workspaceId}/chat/history` : '/tax-assistant-chat-demo' }
            ]
        },
        {
            title: 'Forms & Workflows',
            description: 'Generate, select, and process tax forms efficiently',
            icon: <FormInput className="w-6 h-6" />,
            href: '/form-selection-demo',
            color: 'bg-orange-50 text-orange-600 border-orange-200',
            actions: [
                { label: 'Form Selection', href: '/form-selection-demo' },
                { label: 'Form Generation', href: '/form-generation-workflow-demo' },
                { label: 'Process Forms', href: '/form-selection-demo' }
            ]
        }
    ]

    const workspaceFeatures = workspaceId ? [
        {
            title: 'Workspace Chat',
            description: 'Collaborate with your team using workspace-specific chat',
            icon: <MessageSquare className="w-6 h-6" />,
            href: `/dashboard/workspaces/${workspaceId}/chat`,
            color: 'bg-indigo-50 text-indigo-600 border-indigo-200'
        },
        {
            title: 'Team Management',
            description: 'Manage team members, roles, and permissions',
            icon: <UserPlus className="w-6 h-6" />,
            href: `/dashboard/workspaces/${workspaceId}/teams`,
            color: 'bg-pink-50 text-pink-600 border-pink-200'
        },
        {
            title: 'Translation Tools',
            description: 'Translate documents and forms for international clients',
            icon: <Languages className="w-6 h-6" />,
            href: `/dashboard/workspaces/${workspaceId}/translate`,
            color: 'bg-cyan-50 text-cyan-600 border-cyan-200'
        },
        {
            title: 'Workspace Settings',
            description: 'Configure workspace preferences and integrations',
            icon: <Settings className="w-6 h-6" />,
            href: `/dashboard/workspaces/${workspaceId}/settings`,
            color: 'bg-gray-50 text-gray-600 border-gray-200'
        }
    ] : []

    const managementFeatures = [
        {
            title: 'Dashboard Analytics',
            description: 'View comprehensive analytics and performance metrics',
            icon: <BarChart3 className="w-6 h-6" />,
            href: '/dashboard-demo',
            color: 'bg-emerald-50 text-emerald-600 border-emerald-200'
        },
        {
            title: 'Billing & Subscriptions',
            description: 'Manage your subscription, billing, and payment methods',
            icon: <CreditCard className="w-6 h-6" />,
            href: '/dashboard/billing',
            color: 'bg-yellow-50 text-yellow-600 border-yellow-200'
        },
        {
            title: 'Account Settings',
            description: 'Update your profile, security, and notification preferences',
            icon: <Settings className="w-6 h-6" />,
            href: '/dashboard/settings',
            color: 'bg-slate-50 text-slate-600 border-slate-200'
        }
    ]

    const renderFeatureCard = (feature: any, showActions = false) => (
        <Card key={feature.title} className={`hover:shadow-lg transition-shadow border-2 ${feature.color}`}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${feature.color}`}>
                            {feature.icon}
                        </div>
                        <div>
                            <CardTitle className="text-lg">{feature.title}</CardTitle>
                            <CardDescription className="text-sm mt-1">
                                {feature.description}
                            </CardDescription>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="space-y-3">
                    <Button asChild className="w-full" variant="outline">
                        <Link href={feature.href}>
                            <Eye className="w-4 h-4 mr-2" />
                            Open {feature.title}
                        </Link>
                    </Button>
                    
                    {showActions && feature.actions && (
                        <div className="space-y-2">
                            <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                Quick Actions
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {feature.actions.map((action: any) => (
                                    <Button 
                                        key={action.label} 
                                        asChild 
                                        variant="ghost" 
                                        size="sm"
                                        className="justify-start h-8 text-xs"
                                    >
                                        <Link href={action.href}>
                                            <PlusCircle className="w-3 h-3 mr-2" />
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
    )

    return (
        <div className="space-y-8">
            {/* Core Features */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Core Features</h2>
                        <p className="text-gray-600 mt-1">Essential tools for tax professionals</p>
                    </div>
                    <Badge variant="secondary" className="px-3 py-1">
                        {coreFeatures.length} Features
                    </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {coreFeatures.map(feature => renderFeatureCard(feature, true))}
                </div>
            </div>

            {/* Workspace Features */}
            {workspaceFeatures.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Workspace Tools</h2>
                            <p className="text-gray-600 mt-1">Collaboration and workspace management</p>
                        </div>
                        <Badge variant="secondary" className="px-3 py-1">
                            {workspaceFeatures.length} Tools
                        </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {workspaceFeatures.map(feature => renderFeatureCard(feature))}
                    </div>
                </div>
            )}

            {/* Management & Settings */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Account Management</h2>
                        <p className="text-gray-600 mt-1">Settings, billing, and account preferences</p>
                    </div>
                    <Badge variant="secondary" className="px-3 py-1">
                        {managementFeatures.length} Features
                    </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {managementFeatures.map(feature => renderFeatureCard(feature))}
                </div>
            </div>

            {/* Quick Access Workspace Links */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Workspace Quick Access</h3>
                        <p className="text-gray-600 text-sm">Jump directly to workspace functionality</p>
                    </div>
                    <FolderOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button asChild variant="outline" size="sm" className="justify-start">
                        <Link href="/dashboard/workspaces">
                            <Archive className="w-4 h-4 mr-2" />
                            All Workspaces
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="justify-start">
                        <Link href="/dashboard">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Dashboard Home
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="justify-start">
                        <Link href="/dashboard/memberships">
                            <Users className="w-4 h-4 mr-2" />
                            Memberships
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="justify-start">
                        <Link href="/dashboard/billing">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Billing
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
