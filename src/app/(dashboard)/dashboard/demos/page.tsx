'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    FileText,
    MessageSquare,
    BarChart3,
    Upload,
    Users,
    Settings,
    Building,
    Eye,
    Zap,
    CheckCircle,
    Download,
} from 'lucide-react'

interface Demo {
    id: string
    title: string
    description: string
    path: string
    icon: React.ElementType
    category: 'Forms' | 'Chat' | 'Dashboard' | 'Documents' | 'Clients'
    complexity: 'Basic' | 'Intermediate' | 'Advanced'
    features: string[]
}

const demos: Demo[] = [
    {
        id: 'form-generation-workflow',
        title: 'Form Generation Workflow',
        description:
            'Complete end-to-end tax form generation system with intelligent form selection, preview capabilities, and workflow tracking.',
        path: '/dashboard/demos/form-generation-workflow-demo',
        icon: FileText,
        category: 'Forms',
        complexity: 'Advanced',
        features: ['Form Selection', 'Preview System', 'Generation Engine', 'Progress Tracking'],
    },
    {
        id: 'tax-assistant-chat',
        title: 'Tax Assistant Chat',
        description:
            'AI-powered tax assistant with document analysis, tax calculations, and enterprise-grade security features.',
        path: '/dashboard/demos/tax-assistant-chat-demo',
        icon: MessageSquare,
        category: 'Chat',
        complexity: 'Advanced',
        features: ['AI Conversation', 'Document OCR', 'Tax Calculations', 'PII Detection'],
    },
    {
        id: 'dashboard-overview',
        title: 'Dashboard Overview',
        description: 'Comprehensive dashboard with real-time metrics, activity tracking, and intelligent alerts.',
        path: '/dashboard/demos/dashboard-demo',
        icon: BarChart3,
        category: 'Dashboard',
        complexity: 'Intermediate',
        features: ['Real-time Metrics', 'Interactive Charts', 'Activity Feed', 'Smart Alerts'],
    },
    {
        id: 'document-upload',
        title: 'Document Upload',
        description: 'Advanced document upload system with drag-and-drop, OCR processing, and validation.',
        path: '/dashboard/demos/document-upload-demo',
        icon: Upload,
        category: 'Documents',
        complexity: 'Intermediate',
        features: ['Drag & Drop', 'OCR Processing', 'File Validation', 'Progress Tracking'],
    },
    {
        id: 'document-management',
        title: 'Document Management',
        description: 'Complete document lifecycle management with categorization, search, and archiving.',
        path: '/dashboard/demos/document-management-demo',
        icon: FileText,
        category: 'Documents',
        complexity: 'Advanced',
        features: ['Document Search', 'Categorization', 'Version Control', 'Archive System'],
    },
    {
        id: 'document-extraction',
        title: 'Document Extraction',
        description: 'Intelligent data extraction from tax documents with field mapping and validation.',
        path: '/dashboard/demos/document-extraction-demo',
        icon: Eye,
        category: 'Documents',
        complexity: 'Advanced',
        features: ['Data Extraction', 'Field Mapping', 'Validation', 'Confidence Scoring'],
    },
    {
        id: 'extracted-data-review',
        title: 'Extracted Data Review',
        description: 'Review and edit extracted data with validation tools and correction workflows.',
        path: '/dashboard/demos/extracted-data-review-demo',
        icon: CheckCircle,
        category: 'Documents',
        complexity: 'Intermediate',
        features: ['Data Review', 'Validation Tools', 'Correction Workflow', 'Approval Process'],
    },
    {
        id: 'client-management',
        title: 'Client Management',
        description: 'Comprehensive client management system with profiles, documents, and communication tracking.',
        path: '/dashboard/demos/client-management-demo',
        icon: Users,
        category: 'Clients',
        complexity: 'Intermediate',
        features: ['Client Profiles', 'Document Tracking', 'Communication Log', 'Status Management'],
    },
    {
        id: 'client-onboarding',
        title: 'Client Onboarding',
        description: 'Streamlined client onboarding workflow with document collection and profile setup.',
        path: '/dashboard/demos/client-onboarding-demo',
        icon: Building,
        category: 'Clients',
        complexity: 'Basic',
        features: ['Profile Setup', 'Document Collection', 'Workflow Steps', 'Progress Tracking'],
    },
    {
        id: 'form-selection',
        title: 'Form Selection',
        description: 'Intelligent form selection dashboard with filtering, search, and recommendations.',
        path: '/dashboard/demos/form-selection-demo',
        icon: Settings,
        category: 'Forms',
        complexity: 'Basic',
        features: ['Form Browser', 'Smart Search', 'Recommendations', 'Batch Selection'],
    },
]

const getCategoryColor = (category: string) => {
    switch (category) {
        case 'Forms':
            return 'bg-blue-50 text-blue-700 border-blue-200'
        case 'Chat':
            return 'bg-green-50 text-green-700 border-green-200'
        case 'Dashboard':
            return 'bg-purple-50 text-purple-700 border-purple-200'
        case 'Documents':
            return 'bg-orange-50 text-orange-700 border-orange-200'
        case 'Clients':
            return 'bg-pink-50 text-pink-700 border-pink-200'
        default:
            return 'bg-gray-50 text-gray-700 border-gray-200'
    }
}

const getComplexityColor = (complexity: string) => {
    switch (complexity) {
        case 'Basic':
            return 'bg-green-100 text-green-800'
        case 'Intermediate':
            return 'bg-yellow-100 text-yellow-800'
        case 'Advanced':
            return 'bg-red-100 text-red-800'
        default:
            return 'bg-gray-100 text-gray-800'
    }
}

export default function DemosIndex() {
    const categories = Array.from(new Set(demos.map((demo) => demo.category)))

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Component Demos</h1>
                <p className="text-gray-600">
                    Explore our comprehensive collection of interactive demo components showcasing the full capabilities
                    of the tax workflow management system.
                </p>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Zap className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{demos.length}</div>
                                <div className="text-sm text-gray-600">Total Demos</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Settings className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{categories.length}</div>
                                <div className="text-sm text-gray-600">Categories</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Building className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">
                                    {demos.filter((d) => d.complexity === 'Advanced').length}
                                </div>
                                <div className="text-sm text-gray-600">Advanced</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Eye className="w-4 h-4 text-orange-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">Interactive</div>
                                <div className="text-sm text-gray-600">Experience</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Demos Grid */}
            <div className="space-y-8">
                {categories.map((category) => (
                    <div key={category} className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <h2 className="text-2xl font-semibold">{category}</h2>
                            <Badge variant="outline" className={getCategoryColor(category)}>
                                {demos.filter((d) => d.category === category).length} demos
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {demos
                                .filter((demo) => demo.category === category)
                                .map((demo) => {
                                    const IconComponent = demo.icon
                                    return (
                                        <Card key={demo.id} className="group hover:shadow-lg transition-shadow">
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                                                            <IconComponent className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <CardTitle className="text-lg">{demo.title}</CardTitle>
                                                        </div>
                                                    </div>
                                                    <Badge className={getComplexityColor(demo.complexity)}>
                                                        {demo.complexity}
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <p className="text-sm text-gray-600">{demo.description}</p>

                                                <div className="space-y-2">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        Key Features:
                                                    </div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {demo.features.map((feature) => (
                                                            <Badge key={feature} variant="outline" className="text-xs">
                                                                {feature}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>

                                                <Link href={demo.path}>
                                                    <Button className="w-full group-hover:shadow-sm transition-shadow">
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        View Demo
                                                    </Button>
                                                </Link>
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Start Guide */}
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>Quick Start Guide</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <h4 className="font-medium mb-2">🚀 Getting Started</h4>
                            <ul className="text-sm space-y-1 text-gray-600">
                                <li>• Start with Basic complexity demos</li>
                                <li>• Explore different categories</li>
                                <li>• Try interactive features</li>
                                <li>• Check code implementations</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium mb-2">💡 Best Practices</h4>
                            <ul className="text-sm space-y-1 text-gray-600">
                                <li>• Test with different data sets</li>
                                <li>• Experiment with edge cases</li>
                                <li>• Note performance characteristics</li>
                                <li>• Understand error handling</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium mb-2">🔧 Technical Details</h4>
                            <ul className="text-sm space-y-1 text-gray-600">
                                <li>• All demos use TypeScript</li>
                                <li>• Built with shadcn/ui components</li>
                                <li>• Responsive design patterns</li>
                                <li>• Accessibility compliant</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
