'use client'

import { useState } from 'react'
import { DocumentExtraction } from '@/components/documents/document-extraction'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, AlertCircle, FileText, Settings } from 'lucide-react'

export default function DocumentExtractionDemo() {
    const [currentDocumentId, setCurrentDocumentId] = useState('doc_w2_sample_001')
    const [customDocumentId, setCustomDocumentId] = useState('')
    const [feedback, setFeedback] = useState<{
        type: 'success' | 'error' | null
        message: string
    }>({ type: null, message: '' })

    // Predefined demo documents
    const demoDocuments = [
        {
            id: 'doc_w2_sample_001',
            name: 'W-2 Form Sample',
            description: 'Employee wage and tax statement with high confidence scores'
        },
        {
            id: 'doc_1099_sample_002',
            name: '1099-MISC Form Sample', 
            description: 'Miscellaneous income form with validation warnings'
        },
        {
            id: 'doc_sample_003',
            name: 'Generic Tax Form',
            description: 'Sample form with mixed confidence levels'
        },
        {
            id: 'doc_invalid_404',
            name: 'Invalid Document',
            description: 'This will trigger a 404 error for testing error handling'
        }
    ]

    const handleSaveComplete = (documentId: string) => {
        setFeedback({
            type: 'success',
            message: `Successfully saved corrections for document ${documentId}`
        })
        
        // Clear feedback after 5 seconds
        setTimeout(() => {
            setFeedback({ type: null, message: '' })
        }, 5000)
    }

    const handleError = (error: string) => {
        setFeedback({
            type: 'error',
            message: error
        })
        
        // Clear feedback after 5 seconds
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
                <h1 className="text-3xl font-bold mb-4">Document Extraction Demo</h1>
                <p className="text-gray-600 text-lg">
                    Review and edit tax form classification and extraction results. Test different document types and error scenarios.
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
                                    <div>
                                        <div className="font-medium">{doc.name}</div>
                                        <div className="text-sm text-gray-500 mt-1">
                                            {doc.description}
                                        </div>
                                    </div>
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Custom Document ID */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Settings className="w-5 h-5" />
                            <span>Custom Document</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="customDocId">Document ID</Label>
                                <Input
                                    id="customDocId"
                                    value={customDocumentId}
                                    onChange={(e) => setCustomDocumentId(e.target.value)}
                                    placeholder="Enter document ID..."
                                    className="mt-1"
                                />
                            </div>
                            <Button
                                onClick={loadCustomDocument}
                                disabled={!customDocumentId.trim()}
                                className="w-full"
                            >
                                Load Document
                            </Button>
                            <p className="text-xs text-gray-500">
                                Try IDs ending with different numbers for different form types, or include "invalid" for error testing.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Current Status */}
                <Card>
                    <CardHeader>
                        <CardTitle>Current Document</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div>
                                <Label className="text-sm text-gray-600">Document ID</Label>
                                <p className="font-mono text-sm bg-gray-100 p-2 rounded mt-1">
                                    {currentDocumentId}
                                </p>
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
            <DocumentExtraction
                key={currentDocumentId} // Force re-mount when document changes
                documentId={currentDocumentId}
                onSaveComplete={handleSaveComplete}
                onError={handleError}
            />

            {/* Feature Documentation */}
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Features Demonstrated</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">✓</Badge>
                                <span>Document preview with fallback handling</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">✓</Badge>
                                <span>Form classification with confidence scores</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">✓</Badge>
                                <span>Extracted data display and editing</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">✓</Badge>
                                <span>Confidence level highlighting</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">✓</Badge>
                                <span>Validation error highlighting</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">✓</Badge>
                                <span>Real-time field editing</span>
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
                                <Badge variant="outline" className="mb-1">GET</Badge>
                                <p className="font-mono text-xs bg-gray-100 p-2 rounded">
                                    /api/documents/{'{documentId}'}/extraction/
                                </p>
                                <p className="text-gray-600 mt-1">Retrieves extraction results</p>
                            </div>
                            <div>
                                <Badge variant="outline" className="mb-1">PUT</Badge>
                                <p className="font-mono text-xs bg-gray-100 p-2 rounded">
                                    /api/documents/{'{documentId}'}/extraction/
                                </p>
                                <p className="text-gray-600 mt-1">Saves corrected data</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Error Handling</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start space-x-2">
                                <Badge variant="destructive" className="mt-0.5 text-xs">!</Badge>
                                <span>404 errors for missing documents</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Badge variant="destructive" className="mt-0.5 text-xs">!</Badge>
                                <span>Network error handling</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs border-yellow-300 text-yellow-700">⚠</Badge>
                                <span>Low confidence warnings</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs border-yellow-300 text-yellow-700">⚠</Badge>
                                <span>Validation error display</span>
                            </li>
                            <li className="flex items-start space-x-2">
                                <Badge variant="outline" className="mt-0.5 text-xs">⟲</Badge>
                                <span>Retry functionality</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* Usage Example */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Usage Example</CardTitle>
                </CardHeader>
                <CardContent>
                    <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`import { DocumentExtraction } from '@/components/documents/document-extraction'

function MyComponent() {
    const handleSaveComplete = (documentId: string) => {
        console.log('Extraction saved:', documentId)
        // Handle successful save
    }

    const handleError = (error: string) => {
        console.error('Extraction error:', error)
        // Handle error
    }

    return (
        <DocumentExtraction
            documentId="your-document-id"
            onSaveComplete={handleSaveComplete}
            onError={handleError}
        />
    )
}`}
                    </pre>
                </CardContent>
            </Card>
        </div>
    )
}
