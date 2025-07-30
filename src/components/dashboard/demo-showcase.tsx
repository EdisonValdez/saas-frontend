'use client'

import React from 'react'
import Link from 'next/link'
import {
    FileText,
    Users,
    Upload,
    BarChart3,
    Bot,
    FormInput,
    FileSearch,
    Eye,
    Workflow,
    UserPlus,
    Archive,
    Play,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function DemoShowcase() {
    const demoFeatures = [
        {
            title: 'Document Upload Demo',
            description: 'Experience drag-and-drop document upload with real-time processing',
            icon: <Upload className="w-5 h-5" />,
            href: '/document-upload-demo',
            color: 'bg-blue-50 text-blue-600',
            category: 'Documents',
        },
        {
            title: 'Document Management Demo',
            description: 'Comprehensive document organization and management system',
            icon: <FileText className="w-5 h-5" />,
            href: '/document-management-demo',
            color: 'bg-blue-50 text-blue-600',
            category: 'Documents',
        },
        {
            title: 'Document Extraction Demo',
            description: 'AI-powered data extraction from tax documents',
            icon: <FileSearch className="w-5 h-5" />,
            href: '/document-extraction-demo',
            color: 'bg-blue-50 text-blue-600',
            category: 'Documents',
        },
        {
            title: 'Extracted Data Review',
            description: 'Review and validate extracted document data',
            icon: <Eye className="w-5 h-5" />,
            href: '/extracted-data-review-demo',
            color: 'bg-blue-50 text-blue-600',
            category: 'Documents',
        },
        {
            title: 'Client Management Demo',
            description: 'Professional client database with advanced filtering',
            icon: <Users className="w-5 h-5" />,
            href: '/client-management-demo',
            color: 'bg-purple-50 text-purple-600',
            category: 'Clients',
        },
        {
            title: 'Client Onboarding Demo',
            description: 'Streamlined client onboarding workflow process',
            icon: <UserPlus className="w-5 h-5" />,
            href: '/client-onboarding-demo',
            color: 'bg-purple-50 text-purple-600',
            category: 'Clients',
        },
        {
            title: 'Form Selection Demo',
            description: 'Interactive tax form selection dashboard',
            icon: <FormInput className="w-5 h-5" />,
            href: '/form-selection-demo',
            color: 'bg-orange-50 text-orange-600',
            category: 'Forms',
        },
        {
            title: 'Form Generation Demo',
            description: 'Automated form generation workflow system',
            icon: <Workflow className="w-5 h-5" />,
            href: '/form-generation-workflow-demo',
            color: 'bg-orange-50 text-orange-600',
            category: 'Forms',
        },
        {
            title: 'Tax Assistant Chat',
            description: 'AI-powered tax assistant with document analysis',
            icon: <Bot className="w-5 h-5" />,
            href: '/tax-assistant-chat-demo',
            color: 'bg-green-50 text-green-600',
            category: 'AI Tools',
        },
        {
            title: 'Dashboard Analytics',
            description: 'Comprehensive dashboard with metrics and insights',
            icon: <BarChart3 className="w-5 h-5" />,
            href: '/dashboard-demo',
            color: 'bg-emerald-50 text-emerald-600',
            category: 'Analytics',
        },
    ]

    const categorizedDemos = demoFeatures.reduce(
        (acc, demo) => {
            if (!acc[demo.category]) {
                acc[demo.category] = []
            }
            acc[demo.category].push(demo)
            return acc
        },
        {} as Record<string, typeof demoFeatures>
    )

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900">Feature Demonstrations</h2>
                <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
                    Explore all the powerful features of our tax professional platform through interactive demos
                </p>
                <div className="flex justify-center mt-4">
                    <Badge variant="secondary" className="px-4 py-2">
                        {demoFeatures.length} Interactive Demos
                    </Badge>
                </div>
            </div>

            {/* Categorized Demos */}
            {Object.entries(categorizedDemos).map(([category, demos]) => (
                <div key={category}>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900">{category}</h3>
                            <p className="text-gray-600 text-sm mt-1">
                                {demos.length} demo{demos.length > 1 ? 's' : ''} available
                            </p>
                        </div>
                        <Badge variant="outline">{demos.length}</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {demos.map((demo) => (
                            <Card key={demo.title} className="hover:shadow-lg transition-shadow group">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className={`p-2 rounded-lg ${demo.color}`}>{demo.icon}</div>
                                            <div className="flex-1">
                                                <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                                                    {demo.title}
                                                </CardTitle>
                                            </div>
                                        </div>
                                    </div>
                                    <CardDescription className="text-sm mt-2">{demo.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <Button asChild className="w-full" variant="outline">
                                        <Link href={demo.href}>
                                            <Play className="w-4 h-4 mr-2" />
                                            Try Demo
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 border border-blue-100 text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Get Started?</h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    These demos showcase the full capabilities of our platform. Create a workspace to start using these
                    features with your real data.
                </p>
                <div className="flex justify-center space-x-4">
                    <Button asChild>
                        <Link href="/dashboard/workspaces">
                            <Archive className="w-4 h-4 mr-2" />
                            View Workspaces
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/dashboard">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Return to Dashboard
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
