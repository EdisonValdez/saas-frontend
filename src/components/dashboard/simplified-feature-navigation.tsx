'use client'

import React from 'react'
import Link from 'next/link'
import { FileText, Users, Bot, FormInput, BarChart3, CreditCard, Settings, Eye } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface SimplifiedFeatureNavigationProps {
    workspaceId?: string
}

export function SimplifiedFeatureNavigation({ workspaceId }: SimplifiedFeatureNavigationProps) {
    const coreFeatures = [
        {
            title: 'Document Management',
            description: 'Upload, process, and manage documents with AI',
            icon: <FileText className="w-6 h-6" />,
            href: '/document-upload-demo',
            color: 'bg-blue-50 text-blue-600 border-blue-200',
        },
        {
            title: 'Client Management',
            description: 'Manage client profiles and relationships',
            icon: <Users className="w-6 h-6" />,
            href: '/client-management-demo',
            color: 'bg-purple-50 text-purple-600 border-purple-200',
        },
        {
            title: 'AI Tax Assistant',
            description: 'Chat with AI for tax questions and analysis',
            icon: <Bot className="w-6 h-6" />,
            href: '/tax-assistant-chat-demo',
            color: 'bg-green-50 text-green-600 border-green-200',
        },
        {
            title: 'Forms & Workflows',
            description: 'Generate and process tax forms efficiently',
            icon: <FormInput className="w-6 h-6" />,
            href: '/form-selection-demo',
            color: 'bg-orange-50 text-orange-600 border-orange-200',
        },
    ]

    const quickActions = [
        {
            title: 'Analytics Dashboard',
            description: 'View performance metrics',
            icon: <BarChart3 className="w-5 h-5" />,
            href: '/dashboard-demo',
        },
        {
            title: 'Billing',
            description: 'Manage subscription',
            icon: <CreditCard className="w-5 h-5" />,
            href: '/dashboard/billing',
        },
        {
            title: 'Settings',
            description: 'Account preferences',
            icon: <Settings className="w-5 h-5" />,
            href: '/dashboard/settings',
        },
    ]

    return (
        <div className="space-y-8">
            {/* Core Features */}
            <div>
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Core Features</h2>
                    <p className="text-gray-600 mt-1">Essential tools for tax professionals</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {coreFeatures.map((feature) => (
                        <Card
                            key={feature.title}
                            className={`hover:shadow-lg transition-shadow border-2 ${feature.color}`}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-2 rounded-lg ${feature.color}`}>{feature.icon}</div>
                                    <div>
                                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                                        <CardDescription className="text-sm mt-1">
                                            {feature.description}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <Button asChild className="w-full" variant="outline">
                                    <Link href={feature.href}>
                                        <Eye className="w-4 h-4 mr-2" />
                                        Open {feature.title}
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
                    <p className="text-gray-600 mt-1">Frequently used features</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {quickActions.map((action) => (
                        <Link key={action.title} href={action.href}>
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 rounded-lg bg-gray-50 text-gray-600">{action.icon}</div>
                                        <div>
                                            <h3 className="font-medium text-sm">{action.title}</h3>
                                            <p className="text-xs text-gray-600">{action.description}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Workspace Quick Access */}
            {workspaceId && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Workspace Tools</h3>
                            <p className="text-gray-600 text-sm">Collaboration and workspace features</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <Button asChild variant="outline" size="sm" className="justify-start">
                            <Link href={`/dashboard/workspaces/${workspaceId}/chat`}>Chat</Link>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="justify-start">
                            <Link href={`/dashboard/workspaces/${workspaceId}/teams`}>Teams</Link>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="justify-start">
                            <Link href={`/dashboard/workspaces/${workspaceId}/translate`}>Translate</Link>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
