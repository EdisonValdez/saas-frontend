'use client'

import { useState } from 'react'
import { DashboardOverview } from '@/components/dashboard/dashboard-overview'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, AlertCircle, BarChart3, Settings, Building, Activity } from 'lucide-react'

interface RecentActivity {
    id: string
    type: 'document_uploaded' | 'extraction_completed' | 'client_added' | 'form_processed' | 'validation_error'
    title: string
    description: string
    timestamp: string
    client_name?: string
    document_type?: string
    status: 'success' | 'warning' | 'error' | 'info'
}

export default function DashboardDemo() {
    const [currentWorkspace, setCurrentWorkspace] = useState('demo-workspace-123')
    const [customWorkspace, setCustomWorkspace] = useState('')
    const [feedback, setFeedback] = useState<{
        type: 'success' | 'error' | null
        message: string
    }>({ type: null, message: '' })

    // Predefined demo workspaces
    const demoWorkspaces = [
        {
            id: 'demo-workspace-123',
            name: 'Tax Office Pro',
            description: 'Full-featured workspace with comprehensive data and alerts',
        },
        {
            id: 'small-practice-456',
            name: 'Small Practice',
            description: 'Smaller operation with moderate activity levels',
        },
        {
            id: 'corporate-clients-789',
            name: 'Corporate Focus',
            description: 'High-volume workspace focused on business clients',
        },
        {
            id: 'quiet-workspace-000',
            name: 'Quiet Office',
            description: 'Minimal activity workspace for testing empty states',
        },
    ]

    const handleUploadDocument = () => {
        setFeedback({
            type: 'success',
            message: 'Upload Document action triggered - would navigate to document upload',
        })
        clearFeedback()
    }

    const handleAddClient = () => {
        setFeedback({
            type: 'success',
            message: 'Add Client action triggered - would open client creation form',
        })
        clearFeedback()
    }

    const handleProcessForms = () => {
        setFeedback({
            type: 'success',
            message: 'Process Forms action triggered - would start batch processing',
        })
        clearFeedback()
    }

    const handleViewActivity = (activity: RecentActivity) => {
        setFeedback({
            type: 'success',
            message: `Viewing activity: ${activity.title} for ${activity.client_name || 'system'}`,
        })
        clearFeedback()
    }

    const handleError = (error: string) => {
        setFeedback({
            type: 'error',
            message: error,
        })
        clearFeedback()
    }

    const clearFeedback = () => {
        setTimeout(() => {
            setFeedback({ type: null, message: '' })
        }, 5000)
    }

    const loadCustomWorkspace = () => {
        if (customWorkspace.trim()) {
            setCurrentWorkspace(customWorkspace.trim())
            setCustomWorkspace('')
        }
    }

    return (
        <div className="space-y-6 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4">Dashboard Overview Demo</h1>
                <p className="text-gray-600 text-lg">
                    Comprehensive dashboard for tax form management system with real-time metrics, activity tracking,
                    and intelligent alerts.
                </p>
            </div>

            {/* Demo Controls */}
            <div className="mb-6 grid gap-6 lg:grid-cols-3">
                {/* Workspace Selector */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Building className="w-5 h-5" />
                            <span>Demo Workspaces</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {demoWorkspaces.map((workspace) => (
                                <Button
                                    key={workspace.id}
                                    variant={currentWorkspace === workspace.id ? 'default' : 'outline'}
                                    className="w-full justify-start text-left h-auto p-3"
                                    onClick={() => setCurrentWorkspace(workspace.id)}
                                >
                                    <div>
                                        <div className="font-medium">{workspace.name}</div>
                                        <div className="text-sm text-gray-500 mt-1">{workspace.description}</div>
                                    </div>
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Custom Workspace */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Settings className="w-5 h-5" />
                            <span>Custom Workspace</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="customWorkspace">Workspace ID</Label>
                                <Input
                                    id="customWorkspace"
                                    value={customWorkspace}
                                    onChange={(e) => setCustomWorkspace(e.target.value)}
                                    placeholder="Enter workspace ID..."
                                    className="mt-1"
                                />
                            </div>
                            <Button onClick={loadCustomWorkspace} disabled={!customWorkspace.trim()} className="w-full">
                                Load Workspace
                            </Button>
                            <p className="text-xs text-gray-500">
                                Try different workspace IDs to see varying data patterns and alert scenarios.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Current Status */}
                <Card>
                    <CardHeader>
                        <CardTitle>Dashboard Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div>
                                <Label className="text-sm text-gray-600">Active Workspace</Label>
                                <p className="font-mono text-sm bg-gray-100 p-2 rounded mt-1">{currentWorkspace}</p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <Badge variant="outline" className="text-xs">
                                        ✓
                                    </Badge>
                                    <span className="text-sm">Real-time metrics</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Badge variant="outline" className="text-xs">
                                        ✓
                                    </Badge>
                                    <span className="text-sm">Interactive charts</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Badge variant="outline" className="text-xs">
                                        ✓
                                    </Badge>
                                    <span className="text-sm">Activity tracking</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Badge variant="outline" className="text-xs">
                                        ✓
                                    </Badge>
                                    <span className="text-sm">Smart alerts</span>
                                </div>
                            </div>

                            {feedback.type && (
                                <Alert variant={feedback.type === 'error' ? 'destructive' : 'default'}>
                                    {feedback.type === 'success' ? (
                                        <CheckCircle2 className="h-4 w-4" />
                                    ) : (
                                        <AlertCircle className="h-4 w-4" />
                                    )}
                                    <AlertDescription className="text-xs">{feedback.message}</AlertDescription>
                                </Alert>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Dashboard Component */}
            <DashboardOverview
                key={currentWorkspace} // Force re-mount when workspace changes
                workspaceId={currentWorkspace}
                onUploadDocument={handleUploadDocument}
                onAddClient={handleAddClient}
                onProcessForms={handleProcessForms}
                onViewActivity={handleViewActivity}
                onError={handleError}
            />

            {/* Feature Documentation */}
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Dashboard Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">
                                    📊
                                </Badge>
                                <span>Real-time key performance metrics with trend indicators</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">
                                    📈
                                </Badge>
                                <span>Interactive charts showing form distribution and status</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">
                                    🔄
                                </Badge>
                                <span>Recent activity feed with detailed information</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">
                                    ⚡
                                </Badge>
                                <span>Quick action buttons for common tasks</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">
                                    🚨
                                </Badge>
                                <span>Smart alerts and notifications system</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">
                                    📱
                                </Badge>
                                <span>Fully responsive design for all devices</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Metrics & Analytics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">
                                    📄
                                </Badge>
                                <span>Total documents processed</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">
                                    ✅
                                </Badge>
                                <span>Processing accuracy percentage</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">
                                    ⏱️
                                </Badge>
                                <span>Average processing time tracking</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">
                                    👥
                                </Badge>
                                <span>Active client count</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">
                                    📋
                                </Badge>
                                <span>Pending tasks queue</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">
                                    📊
                                </Badge>
                                <span>Trend analysis with period comparisons</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">API Integration</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 text-sm">
                            <div>
                                <Badge variant="outline" className="mb-1">
                                    GET
                                </Badge>
                                <p className="font-mono text-xs bg-gray-100 p-2 rounded">/api/dashboard/metrics/</p>
                                <p className="text-gray-600 mt-1">System metrics and chart data</p>
                            </div>
                            <div>
                                <Badge variant="outline" className="mb-1">
                                    GET
                                </Badge>
                                <p className="font-mono text-xs bg-gray-100 p-2 rounded">
                                    /api/dashboard/recent-activity/
                                </p>
                                <p className="text-gray-600 mt-1">Recent user and system activity</p>
                            </div>
                            <div>
                                <Badge variant="outline" className="mb-1">
                                    GET
                                </Badge>
                                <p className="font-mono text-xs bg-gray-100 p-2 rounded">/api/dashboard/alerts/</p>
                                <p className="text-gray-600 mt-1">System alerts and notifications</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Chart Types Reference */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Chart Types & Visualizations</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 border rounded-lg bg-gray-50">
                            <BarChart3 className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                            <div className="font-medium">Bar Charts</div>
                            <div className="text-sm text-gray-500">Form type distribution</div>
                        </div>
                        <div className="text-center p-4 border rounded-lg bg-gray-50">
                            <Activity className="w-8 h-8 mx-auto mb-2 text-green-600" />
                            <div className="font-medium">Area Charts</div>
                            <div className="text-sm text-gray-500">Weekly activity trends</div>
                        </div>
                        <div className="text-center p-4 border rounded-lg bg-gray-50">
                            <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-purple-600"></div>
                            <div className="font-medium">Pie Charts</div>
                            <div className="text-sm text-gray-500">Processing status breakdown</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Usage Example */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Usage Example</CardTitle>
                </CardHeader>
                <CardContent>
                    <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                        {`import { DashboardOverview } from '@/components/dashboard/dashboard-overview'

function MyDashboard() {
    const handleUploadDocument = () => {
        // Navigate to document upload
        router.push('/upload')
    }

    const handleAddClient = () => {
        // Open client creation modal
        setShowClientModal(true)
    }

    const handleProcessForms = () => {
        // Start batch processing
        startBatchProcess()
    }

    return (
        <DashboardOverview
            workspaceId="your-workspace-id"
            onUploadDocument={handleUploadDocument}
            onAddClient={handleAddClient}
            onProcessForms={handleProcessForms}
            onViewActivity={(activity) => console.log(activity)}
            onError={(error) => showErrorToast(error)}
        />
    )
}`}
                    </pre>
                </CardContent>
            </Card>
        </div>
    )
}
