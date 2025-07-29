'use client'

import { useState } from 'react'
import { ExtractedDataReview } from '@/components/documents/extracted-data-review'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CheckCircle2, AlertCircle, FileText, Settings, Eye } from 'lucide-react'

interface ExtractedData {
    document_id: string
    document_type: 'W-2' | '1099-NEC' | '1099-MISC' | 'W-4' | '1040' | 'Schedule C' | 'Other'
    extraction_date: string
    confidence_score: number
    status: 'pending_review' | 'reviewed' | 'approved' | 'rejected'
}

export default function ExtractedDataReviewDemo() {
    const [currentDocumentId, setCurrentDocumentId] = useState('doc_w2_sample_001')
    const [customDocumentId, setCustomDocumentId] = useState('')
    const [readOnlyMode, setReadOnlyMode] = useState(false)
    const [feedback, setFeedback] = useState<{
        type: 'success' | 'error' | null
        message: string
    }>({ type: null, message: '' })

    // Predefined demo documents
    const demoDocuments = [
        {
            id: 'doc_w2_sample_001',
            name: 'W-2 Form Sample',
            type: 'W-2',
            description: 'Employee wage statement with typical field extractions'
        },
        {
            id: 'doc_1099nec_sample_002',
            name: '1099-NEC Form Sample',
            type: '1099-NEC',
            description: 'Nonemployee compensation form with contractor payments'
        },
        {
            id: 'doc_1099misc_sample_003',
            name: '1099-MISC Form Sample',
            type: '1099-MISC',
            description: 'Miscellaneous income form with various income types'
        },
        {
            id: 'doc_sample_validation_004',
            name: 'Document with Validation Issues',
            type: 'W-2',
            description: 'Sample document with intentional validation errors for testing'
        },
        {
            id: 'doc_invalid_404',
            name: 'Invalid Document ID',
            type: 'Other',
            description: 'This will trigger a 404 error for testing error handling'
        }
    ]

    const handleSave = (data: ExtractedData) => {
        setFeedback({
            type: 'success',
            message: `Successfully saved changes for document ${data.document_id}`
        })
        clearFeedback()
    }

    const handleSubmit = (data: ExtractedData) => {
        setFeedback({
            type: 'success',
            message: `Document ${data.document_id} submitted for approval successfully`
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

    const loadCustomDocument = () => {
        if (customDocumentId.trim()) {
            setCurrentDocumentId(customDocumentId.trim())
            setCustomDocumentId('')
        }
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4">Extracted Data Review Demo</h1>
                <p className="text-gray-600 text-lg">
                    Professional interface for reviewing and correcting tax form data extracted from documents. 
                    Features side-by-side comparison, tax-specific validation, and comprehensive error handling.
                </p>
            </div>

            {/* Demo Controls */}
            <div className="mb-6 grid gap-6 lg:grid-cols-3">
                {/* Document Selector */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <FileText className="w-5 h-5" />
                            <span>Demo Documents</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {demoDocuments.map((doc) => (
                                <Button
                                    key={doc.id}
                                    variant={currentDocumentId === doc.id ? "default" : "outline"}
                                    className="w-full justify-start text-left h-auto p-3"
                                    onClick={() => setCurrentDocumentId(doc.id)}
                                >
                                    <div className="flex items-start justify-between w-full">
                                        <div className="flex-1">
                                            <div className="font-medium">{doc.name}</div>
                                            <div className="text-sm text-gray-500 mt-1">
                                                {doc.description}
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="ml-2 text-xs">
                                            {doc.type}
                                        </Badge>
                                    </div>
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Configuration */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Settings className="w-5 h-5" />
                            <span>Configuration</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="customDoc">Custom Document ID</Label>
                                <div className="flex space-x-2 mt-1">
                                    <Input
                                        id="customDoc"
                                        value={customDocumentId}
                                        onChange={(e) => setCustomDocumentId(e.target.value)}
                                        placeholder="Enter document ID..."
                                        className="text-sm"
                                    />
                                    <Button
                                        onClick={loadCustomDocument}
                                        disabled={!customDocumentId.trim()}
                                        size="sm"
                                    >
                                        Load
                                    </Button>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="readOnly">Display Mode</Label>
                                <Select 
                                    value={readOnlyMode ? 'readonly' : 'editable'} 
                                    onValueChange={(value) => setReadOnlyMode(value === 'readonly')}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="editable">Editable (Review Mode)</SelectItem>
                                        <SelectItem value="readonly">Read-Only (View Mode)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
                                <p><strong>Tip:</strong> Try documents ending in different numbers for various form types, or include "invalid" for error testing.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Current Status */}
                <Card>
                    <CardHeader>
                        <CardTitle>Demo Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div>
                                <Label className="text-sm text-gray-600">Active Document</Label>
                                <p className="font-mono text-sm bg-gray-100 p-2 rounded mt-1">
                                    {currentDocumentId}
                                </p>
                            </div>
                            
                            <div>
                                <Label className="text-sm text-gray-600">Mode</Label>
                                <Badge 
                                    variant={readOnlyMode ? "secondary" : "default"} 
                                    className="mt-1 block w-fit"
                                >
                                    {readOnlyMode ? 'Read-Only' : 'Editable'}
                                </Badge>
                            </div>
                            
                            {feedback.type && (
                                <Alert variant={feedback.type === 'error' ? 'destructive' : 'default'}>
                                    {feedback.type === 'success' ? (
                                        <CheckCircle2 className="h-4 w-4" />
                                    ) : (
                                        <AlertCircle className="h-4 w-4" />
                                    )}
                                    <AlertDescription className="text-sm">
                                        {feedback.message}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Component */}
            <ExtractedDataReview
                key={`${currentDocumentId}-${readOnlyMode}`} // Force re-mount when config changes
                documentId={currentDocumentId}
                onSave={handleSave}
                onSubmit={handleSubmit}
                onError={handleError}
                readOnly={readOnlyMode}
            />

            {/* Feature Documentation */}
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Review Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">📄</Badge>
                                <span>Side-by-side document and data comparison</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">✏️</Badge>
                                <span>Inline editing of extracted field values</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">🎯</Badge>
                                <span>Field highlighting and document navigation</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">📊</Badge>
                                <span>Confidence scores and visual indicators</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">🔄</Badge>
                                <span>Reset to original values functionality</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">📱</Badge>
                                <span>Responsive design with expandable views</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Validation Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">🔢</Badge>
                                <span>SSN format validation (XXX-XX-XXXX)</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">🏢</Badge>
                                <span>EIN format validation (XX-XXXXXXX)</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">💰</Badge>
                                <span>Currency value validation and formatting</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">📅</Badge>
                                <span>Date format validation (MM/DD/YYYY)</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">⚠️</Badge>
                                <span>Required field validation</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">🎯</Badge>
                                <span>Real-time validation feedback</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Workflow Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">💾</Badge>
                                <span>Save changes for later review</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">✅</Badge>
                                <span>Submit for approval workflow</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">📊</Badge>
                                <span>Progress tracking and completion status</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">🔒</Badge>
                                <span>Read-only mode for approved documents</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">📝</Badge>
                                <span>Modification tracking and audit trail</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">🎨</Badge>
                                <span>Accessibility features and keyboard navigation</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* Supported Document Types */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Supported Tax Document Types</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {[
                            { type: 'W-2', label: 'W-2', description: 'Wage & Tax Statement' },
                            { type: '1099-NEC', label: '1099-NEC', description: 'Nonemployee Compensation' },
                            { type: '1099-MISC', label: '1099-MISC', description: 'Miscellaneous Income' },
                            { type: 'W-4', label: 'W-4', description: 'Employee Withholding' },
                            { type: '1040', label: '1040', description: 'Individual Tax Return' },
                            { type: 'Schedule C', label: 'Schedule C', description: 'Business Income' }
                        ].map(({ type, label, description }) => (
                            <div key={type} className="text-center p-3 border rounded-lg bg-gray-50">
                                <div className="font-medium text-sm mb-1">{label}</div>
                                <div className="text-xs text-gray-500">{description}</div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* API Information */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>API Integration</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <h4 className="font-medium mb-2">Data Operations</h4>
                            <div className="space-y-2">
                                <div>
                                    <Badge variant="outline" className="mb-1">GET</Badge>
                                    <p className="font-mono text-xs bg-gray-100 p-2 rounded">
                                        /api/documents/{'{id}'}/extracted-data/
                                    </p>
                                    <p className="text-gray-600 mt-1">Retrieve extracted data for review</p>
                                </div>
                                <div>
                                    <Badge variant="outline" className="mb-1">PUT</Badge>
                                    <p className="font-mono text-xs bg-gray-100 p-2 rounded">
                                        /api/documents/{'{id}'}/extracted-data/
                                    </p>
                                    <p className="text-gray-600 mt-1">Save corrections and modifications</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-medium mb-2">Workflow Operations</h4>
                            <div className="space-y-2">
                                <div>
                                    <Badge variant="outline" className="mb-1">POST</Badge>
                                    <p className="font-mono text-xs bg-gray-100 p-2 rounded">
                                        /api/documents/{'{id}'}/extracted-data/submit/
                                    </p>
                                    <p className="text-gray-600 mt-1">Submit for approval workflow</p>
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
{`import { ExtractedDataReview } from '@/components/documents/extracted-data-review'

function MyComponent() {
    const handleSave = (data) => {
        console.log('Saved extracted data:', data)
        // Handle save completion
    }

    const handleSubmit = (data) => {
        console.log('Submitted for approval:', data)
        // Handle submission completion
    }

    const handleError = (error) => {
        console.error('Review error:', error)
        // Handle error display
    }

    return (
        <ExtractedDataReview
            documentId="your-document-id"
            onSave={handleSave}
            onSubmit={handleSubmit}
            onError={handleError}
            readOnly={false}
        />
    )
}`}
                    </pre>
                </CardContent>
            </Card>
        </div>
    )
}
