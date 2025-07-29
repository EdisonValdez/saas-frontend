'use client'

import { useState } from 'react'
import { DocumentManager } from '@/components/documents/document-manager'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, AlertCircle, FileText, Settings, Building, Upload } from 'lucide-react'

interface Document {
    id: string
    filename: string
    file_type: string
    file_size: number
    upload_date: string
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'archived'
    document_type?: 'W-2' | '1099-NEC' | '1099-MISC' | 'W-4' | '1040' | 'Schedule C' | 'Other'
    client_id?: string
    client_name?: string
    file_url?: string
    thumbnail_url?: string
    extraction_confidence?: number
    error_message?: string
    tags?: string[]
}

export default function DocumentManagementDemo() {
    const [currentWorkspace, setCurrentWorkspace] = useState('demo-workspace-123')
    const [currentClient, setCurrentClient] = useState<string>('')
    const [customWorkspace, setCustomWorkspace] = useState('')
    const [customClient, setCustomClient] = useState('')
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
    const [feedback, setFeedback] = useState<{
        type: 'success' | 'error' | null
        message: string
    }>({ type: null, message: '' })

    // Predefined demo scenarios
    const demoWorkspaces = [
        {
            id: 'demo-workspace-123',
            name: 'Tax Office Pro',
            description: 'Full workspace with various document types and statuses'
        },
        {
            id: 'small-practice-456',
            name: 'Small Practice',
            description: 'Smaller collection with individual tax documents'
        },
        {
            id: 'corporate-clients-789',
            name: 'Corporate Focus',
            description: 'Large workspace with business tax documents'
        }
    ]

    const demoClients = [
        { id: '', name: 'All Clients', description: 'Show documents for all clients' },
        { id: 'client_001', name: 'John Smith', description: 'Individual taxpayer' },
        { id: 'client_002', name: 'Acme Corporation', description: 'Corporate client' },
        { id: 'client_003', name: 'TechStart LLC', description: 'Small business client' }
    ]

    const handleDocumentSelect = (document: Document) => {
        setSelectedDocument(document)
        setFeedback({
            type: 'success',
            message: `Selected document: ${document.filename} (${document.document_type || 'Unknown type'})`
        })
        clearFeedback()
    }

    const handleDocumentUpdate = (document: Document) => {
        setFeedback({
            type: 'success',
            message: `Document updated: ${document.filename}`
        })
        clearFeedback()
    }

    const handleError = (error: string) => {
        setFeedback({
            type: 'error',
            message: error
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

    const loadCustomClient = () => {
        if (customClient.trim()) {
            setCurrentClient(customClient.trim())
            setCustomClient('')
        }
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4">Document Management Demo</h1>
                <p className="text-gray-600 text-lg">
                    Comprehensive document upload and management system for tax professionals. Upload, organize, preview, and manage tax documents with automatic classification.
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
                                    variant={currentWorkspace === workspace.id ? "default" : "outline"}
                                    className="w-full justify-start text-left h-auto p-3"
                                    onClick={() => {
                                        setCurrentWorkspace(workspace.id)
                                        setSelectedDocument(null)
                                    }}
                                >
                                    <div>
                                        <div className="font-medium">{workspace.name}</div>
                                        <div className="text-sm text-gray-500 mt-1">
                                            {workspace.description}
                                        </div>
                                    </div>
                                </Button>
                            ))}
                        </div>
                        
                        <div className="mt-4 space-y-2">
                            <Label htmlFor="customWorkspace">Custom Workspace</Label>
                            <div className="flex space-x-2">
                                <Input
                                    id="customWorkspace"
                                    value={customWorkspace}
                                    onChange={(e) => setCustomWorkspace(e.target.value)}
                                    placeholder="Enter workspace ID..."
                                    className="text-sm"
                                />
                                <Button
                                    onClick={loadCustomWorkspace}
                                    disabled={!customWorkspace.trim()}
                                    size="sm"
                                >
                                    Load
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Client Selector */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <FileText className="w-5 h-5" />
                            <span>Client Filter</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {demoClients.map((client) => (
                                <Button
                                    key={client.id}
                                    variant={currentClient === client.id ? "default" : "outline"}
                                    className="w-full justify-start text-left h-auto p-3"
                                    onClick={() => setCurrentClient(client.id)}
                                >
                                    <div>
                                        <div className="font-medium">{client.name}</div>
                                        <div className="text-sm text-gray-500 mt-1">
                                            {client.description}
                                        </div>
                                    </div>
                                </Button>
                            ))}
                        </div>

                        <div className="mt-4 space-y-2">
                            <Label htmlFor="customClient">Custom Client ID</Label>
                            <div className="flex space-x-2">
                                <Input
                                    id="customClient"
                                    value={customClient}
                                    onChange={(e) => setCustomClient(e.target.value)}
                                    placeholder="Enter client ID..."
                                    className="text-sm"
                                />
                                <Button
                                    onClick={loadCustomClient}
                                    disabled={!customClient.trim()}
                                    size="sm"
                                >
                                    Load
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Current Status */}
                <Card>
                    <CardHeader>
                        <CardTitle>Current Configuration</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div>
                                <Label className="text-sm text-gray-600">Active Workspace</Label>
                                <p className="font-mono text-sm bg-gray-100 p-2 rounded mt-1">
                                    {currentWorkspace}
                                </p>
                            </div>
                            
                            <div>
                                <Label className="text-sm text-gray-600">Client Filter</Label>
                                <p className="text-sm bg-gray-100 p-2 rounded mt-1">
                                    {currentClient || 'All clients'}
                                </p>
                            </div>
                            
                            {selectedDocument && (
                                <div>
                                    <Label className="text-sm text-gray-600">Selected Document</Label>
                                    <div className="bg-blue-50 border border-blue-200 p-2 rounded mt-1">
                                        <p className="font-medium text-blue-900 text-sm truncate">
                                            {selectedDocument.filename}
                                        </p>
                                        <p className="text-sm text-blue-700">
                                            {selectedDocument.document_type || 'Unknown'} • {selectedDocument.status}
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
                                    <AlertDescription className="text-xs">
                                        {feedback.message}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Document Manager Component */}
            <DocumentManager
                key={`${currentWorkspace}-${currentClient}`} // Force re-mount when config changes
                workspaceId={currentWorkspace}
                clientId={currentClient || undefined}
                onDocumentSelect={handleDocumentSelect}
                onDocumentUpdate={handleDocumentUpdate}
                onError={handleError}
                maxFileSize={10}
                allowedTypes={['application/pdf', 'image/jpeg', 'image/png', 'image/tiff']}
            />

            {/* Feature Documentation */}
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Upload Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">📁</Badge>
                                <span>Drag-and-drop file upload with visual feedback</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">📄</Badge>
                                <span>Multiple file format support (PDF, JPG, PNG, TIFF)</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">📊</Badge>
                                <span>Real-time upload progress indicators</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">🔍</Badge>
                                <span>Automatic document type classification</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">⚡</Badge>
                                <span>File validation and error handling</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">📏</Badge>
                                <span>File size limits and type restrictions</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Management Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">📋</Badge>
                                <span>Comprehensive document listing with status tracking</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">🔍</Badge>
                                <span>Advanced search and filtering capabilities</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">📊</Badge>
                                <span>Sortable columns with directional indicators</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">👁️</Badge>
                                <span>Document preview with detailed information</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">📥</Badge>
                                <span>Archive and delete functionality</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">🔄</Badge>
                                <span>Reprocessing for failed documents</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">View Options</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">📊</Badge>
                                <span>List view with detailed table layout</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">🗃️</Badge>
                                <span>Grid view with card-based layout</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">🏷️</Badge>
                                <span>Status badges with color coding</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">📱</Badge>
                                <span>Responsive design for all screen sizes</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">⚙️</Badge>
                                <span>Configurable display options</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* Document Status Reference */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Document Status Reference</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {[
                            { status: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800', description: 'Waiting for processing' },
                            { status: 'processing', label: 'Processing', color: 'bg-blue-100 text-blue-800', description: 'Currently being processed' },
                            { status: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800', description: 'Successfully processed' },
                            { status: 'failed', label: 'Failed', color: 'bg-red-100 text-red-800', description: 'Processing failed' },
                            { status: 'archived', label: 'Archived', color: 'bg-gray-100 text-gray-800', description: 'Archived for storage' }
                        ].map(({ status, label, color, description }) => (
                            <div key={status} className="text-center p-3 border rounded-lg bg-gray-50">
                                <Badge variant="outline" className={`${color} mb-2`}>
                                    {label}
                                </Badge>
                                <div className="text-xs text-gray-500">{description}</div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* API Endpoints */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>API Integration</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <h4 className="font-medium mb-2">Upload & List</h4>
                            <div className="space-y-2">
                                <div>
                                    <Badge variant="outline" className="mb-1">POST</Badge>
                                    <p className="font-mono text-xs bg-gray-100 p-2 rounded">
                                        /api/documents/upload/
                                    </p>
                                </div>
                                <div>
                                    <Badge variant="outline" className="mb-1">GET</Badge>
                                    <p className="font-mono text-xs bg-gray-100 p-2 rounded">
                                        /api/documents/list/
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-medium mb-2">Document Operations</h4>
                            <div className="space-y-2">
                                <div>
                                    <Badge variant="outline" className="mb-1">POST</Badge>
                                    <p className="font-mono text-xs bg-gray-100 p-2 rounded">
                                        /api/documents/{'{id}'}/archive/
                                    </p>
                                </div>
                                <div>
                                    <Badge variant="outline" className="mb-1">DELETE</Badge>
                                    <p className="font-mono text-xs bg-gray-100 p-2 rounded">
                                        /api/documents/{'{id}'}/
                                    </p>
                                </div>
                            </div>
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
{`import { DocumentManager } from '@/components/documents/document-manager'

function MyComponent() {
    const handleDocumentSelect = (document) => {
        console.log('Selected document:', document)
        // Handle document selection
    }

    const handleDocumentUpdate = (document) => {
        console.log('Document updated:', document)
        // Handle document updates
    }

    const handleError = (error) => {
        console.error('Document error:', error)
        // Handle errors
    }

    return (
        <DocumentManager
            workspaceId="your-workspace-id"
            clientId="optional-client-id"
            onDocumentSelect={handleDocumentSelect}
            onDocumentUpdate={handleDocumentUpdate}
            onError={handleError}
            maxFileSize={10}
            allowedTypes={['application/pdf', 'image/jpeg', 'image/png']}
        />
    )
}`}
                    </pre>
                </CardContent>
            </Card>
        </div>
    )
}
