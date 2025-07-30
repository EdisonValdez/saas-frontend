'use client'

import { useState } from 'react'
import { ClientManagement } from '@/components/clients/client-management'
import { DemoLayout } from '@/components/layouts/demo-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, AlertCircle, Users, Settings, Building, FileText } from 'lucide-react'

interface Client {
    id: string
    name: string
    status: 'active' | 'inactive'
    entity_type: 'individual' | 'corporation' | 'partnership' | 'llc' | 'nonprofit' | 'trust'
    document_count: number
    workspace: string
    metadata: {
        email?: string
        phone?: string
        address?: string
        tax_id?: string
        notes?: string
        created_date: string
        last_updated: string
    }
}

export default function ClientManagementDemo() {
    const [currentWorkspace, setCurrentWorkspace] = useState('demo-workspace-123')
    const [customWorkspace, setCustomWorkspace] = useState('')
    const [selectedClient, setSelectedClient] = useState<Client | null>(null)
    const [feedback, setFeedback] = useState<{
        type: 'success' | 'error' | null
        message: string
    }>({ type: null, message: '' })

    // Predefined demo workspaces
    const demoWorkspaces = [
        {
            id: 'demo-workspace-123',
            name: 'Tax Office Pro',
            description: 'Full workspace with mixed client types and documents',
        },
        {
            id: 'small-practice-456',
            name: 'Small Practice',
            description: 'Smaller workspace with individual clients',
        },
        {
            id: 'corporate-clients-789',
            name: 'Corporate Focus',
            description: 'Workspace focused on business clients',
        },
    ]

    const handleClientSelect = (client: Client) => {
        setSelectedClient(client)
        setFeedback({
            type: 'success',
            message: `Selected client: ${client.name} (${client.id})`,
        })

        // Clear feedback after 5 seconds
        setTimeout(() => {
            setFeedback({ type: null, message: '' })
        }, 5000)
    }

    const handleError = (error: string) => {
        setFeedback({
            type: 'error',
            message: error,
        })

        // Clear feedback after 5 seconds
        setTimeout(() => {
            setFeedback({ type: null, message: '' })
        }, 5000)
    }

    const loadCustomWorkspace = () => {
        if (customWorkspace.trim()) {
            setCurrentWorkspace(customWorkspace.trim())
            setCustomWorkspace('')
            setSelectedClient(null)
        }
    }

    return (
        <DemoLayout>
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-4">Client Management Demo</h1>
                    <p className="text-gray-600 text-lg">
                        Professional client management system for tax professionals. Manage clients, track documents,
                        and maintain detailed records.
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
                                        onClick={() => {
                                            setCurrentWorkspace(workspace.id)
                                            setSelectedClient(null)
                                        }}
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
                                <Button
                                    onClick={loadCustomWorkspace}
                                    disabled={!customWorkspace.trim()}
                                    className="w-full"
                                >
                                    Load Workspace
                                </Button>
                                <p className="text-xs text-gray-500">
                                    Try any workspace ID to see different client sets or test empty workspaces.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Current Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Current Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div>
                                    <Label className="text-sm text-gray-600">Active Workspace</Label>
                                    <p className="font-mono text-sm bg-gray-100 p-2 rounded mt-1">{currentWorkspace}</p>
                                </div>

                                {selectedClient && (
                                    <div>
                                        <Label className="text-sm text-gray-600">Selected Client</Label>
                                        <div className="bg-blue-50 border border-blue-200 p-2 rounded mt-1">
                                            <p className="font-medium text-blue-900">{selectedClient.name}</p>
                                            <p className="text-sm text-blue-700">
                                                {selectedClient.entity_type} • {selectedClient.document_count} documents
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {feedback.type && (
                                    <Alert variant={feedback.type === 'error' ? 'destructive' : 'default'}>
                                        {feedback.type === 'success' ? (
                                            <CheckCircle2 className="h-4 w-4" />
                                        ) : (
                                            <AlertCircle className="h-4 w-4" />
                                        )}
                                        <AlertDescription className="text-sm">{feedback.message}</AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Component */}
                <ClientManagement
                    key={currentWorkspace} // Force re-mount when workspace changes
                    workspaceId={currentWorkspace}
                    onClientSelect={handleClientSelect}
                    onError={handleError}
                />

                {/* Feature Documentation */}
                <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Core Features</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-start space-x-2">
                                    <Badge variant="outline" className="mt-0.5 text-xs">
                                        ✓
                                    </Badge>
                                    <span>Professional client list with key information</span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <Badge variant="outline" className="mt-0.5 text-xs">
                                        ✓
                                    </Badge>
                                    <span>Advanced search and filtering</span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <Badge variant="outline" className="mt-0.5 text-xs">
                                        ✓
                                    </Badge>
                                    <span>Add and edit client information</span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <Badge variant="outline" className="mt-0.5 text-xs">
                                        ✓
                                    </Badge>
                                    <span>Document count tracking</span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <Badge variant="outline" className="mt-0.5 text-xs">
                                        ✓
                                    </Badge>
                                    <span>Multiple entity type support</span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <Badge variant="outline" className="mt-0.5 text-xs">
                                        ✓
                                    </Badge>
                                    <span>Status management (active/inactive)</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Data Management</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-start space-x-2">
                                    <Badge variant="outline" className="mt-0.5 text-xs">
                                        📄
                                    </Badge>
                                    <span>Pagination with 20 clients per page</span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <Badge variant="outline" className="mt-0.5 text-xs">
                                        🔍
                                    </Badge>
                                    <span>Real-time search by name, ID, or email</span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <Badge variant="outline" className="mt-0.5 text-xs">
                                        📊
                                    </Badge>
                                    <span>Sortable columns (name, type, status, etc.)</span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <Badge variant="outline" className="mt-0.5 text-xs">
                                        🏷️
                                    </Badge>
                                    <span>Filter by status and entity type</span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <Badge variant="outline" className="mt-0.5 text-xs">
                                        📈
                                    </Badge>
                                    <span>Summary statistics dashboard</span>
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
                                    <p className="font-mono text-xs bg-gray-100 p-2 rounded">/api/clients/</p>
                                    <p className="text-gray-600 mt-1">List clients with filtering and pagination</p>
                                </div>
                                <div>
                                    <Badge variant="outline" className="mb-1">
                                        POST
                                    </Badge>
                                    <p className="font-mono text-xs bg-gray-100 p-2 rounded">/api/clients/</p>
                                    <p className="text-gray-600 mt-1">Create new client</p>
                                </div>
                                <div>
                                    <Badge variant="outline" className="mb-1">
                                        PUT
                                    </Badge>
                                    <p className="font-mono text-xs bg-gray-100 p-2 rounded">
                                        /api/clients/{'{clientId}'}/
                                    </p>
                                    <p className="text-gray-600 mt-1">Update client information</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Entity Types Reference */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Supported Entity Types</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                            {[
                                { type: 'individual', label: 'Individual', icon: '👤' },
                                { type: 'corporation', label: 'Corporation', icon: '🏢' },
                                { type: 'partnership', label: 'Partnership', icon: '🤝' },
                                { type: 'llc', label: 'LLC', icon: '🏛️' },
                                { type: 'nonprofit', label: 'Nonprofit', icon: '🎗️' },
                                { type: 'trust', label: 'Trust', icon: '🛡️' },
                            ].map(({ type, label, icon }) => (
                                <div key={type} className="text-center p-3 border rounded-lg bg-gray-50">
                                    <div className="text-2xl mb-1">{icon}</div>
                                    <div className="font-medium text-sm">{label}</div>
                                    <div className="text-xs text-gray-500">{type}</div>
                                </div>
                            ))}
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
                            {`import { ClientManagement } from '@/components/clients/client-management'

function MyComponent() {
    const handleClientSelect = (client) => {
        console.log('Selected client:', client)
        // Navigate to client details or documents
    }

    const handleError = (error) => {
        console.error('Client management error:', error)
        // Show error notification
    }

    return (
        <ClientManagement
            workspaceId="your-workspace-id"
            onClientSelect={handleClientSelect}
            onError={handleError}
        />
    )
}`}
                        </pre>
                    </CardContent>
                </Card>
            </div>
        </DemoLayout>
    )
}
