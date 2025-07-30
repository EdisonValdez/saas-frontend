'use client'

import { useState } from 'react'
import { DocumentUpload } from '@/components/documents/document-upload'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, AlertCircle, FileText, Upload, Eye, Settings, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default function DocumentUploadDemo() {
    const [uploadStatus, setUploadStatus] = useState<{
        type: 'success' | 'error' | null
        message: string
        documentIds?: string[]
    }>({ type: null, message: '' })

    const handleUploadComplete = (documentIds: string[]) => {
        setUploadStatus({
            type: 'success',
            message: `Successfully uploaded ${documentIds.length} document(s)`,
            documentIds
        })
        
        // Auto-clear the message after 5 seconds
        setTimeout(() => {
            setUploadStatus({ type: null, message: '' })
        }, 5000)
    }

    const handleUploadError = (error: string) => {
        setUploadStatus({
            type: 'error',
            message: error
        })
        
        // Auto-clear the message after 5 seconds
        setTimeout(() => {
            setUploadStatus({ type: null, message: '' })
        }, 5000)
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4">Document Upload Demo</h1>
                <p className="text-gray-600 text-lg">
                    Upload tax documents using our drag-and-drop interface. Supports PDF, JPG, PNG, and TIFF formats.
                </p>
            </div>

            {/* Status Messages */}
            {uploadStatus.type && (
                <div className="mb-6">
                    <Alert variant={uploadStatus.type === 'error' ? 'destructive' : 'default'}>
                        {uploadStatus.type === 'success' ? (
                            <CheckCircle2 className="h-4 w-4" />
                        ) : (
                            <AlertCircle className="h-4 w-4" />
                        )}
                        <AlertDescription>
                            {uploadStatus.message}
                            {uploadStatus.documentIds && uploadStatus.documentIds.length > 0 && (
                                <div className="mt-2">
                                    <strong>Document IDs:</strong>
                                    <ul className="list-disc list-inside mt-1">
                                        {uploadStatus.documentIds.map((id) => (
                                            <li key={id} className="text-sm font-mono">
                                                {id}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </AlertDescription>
                    </Alert>
                </div>
            )}

            {/* Document Upload Component */}
            <DocumentUpload
                clientId="demo-client-123"
                onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                maxFiles={5}
                maxFileSize={10}
            />

            {/* Documentation */}
            <div className="mt-12 grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Supported Formats</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            <li className="flex items-center space-x-2">
                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                <span><strong>PDF</strong> - Portable Document Format</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                <span><strong>JPG/JPEG</strong> - Joint Photographic Experts Group</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                <span><strong>PNG</strong> - Portable Network Graphics</span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                <span><strong>TIFF</strong> - Tagged Image File Format</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Upload Specifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            <li><strong>Maximum file size:</strong> 10 MB per file</li>
                            <li><strong>Maximum files:</strong> 5 files per upload</li>
                            <li><strong>Upload method:</strong> Drag & drop or click to select</li>
                            <li><strong>Preview:</strong> Available for image files</li>
                            <li><strong>Processing:</strong> Automatic upon upload</li>
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
{`import { DocumentUpload } from '@/components/documents/document-upload'

function MyComponent() {
    const handleUploadComplete = (documentIds: string[]) => {
        console.log('Upload completed:', documentIds)
        // Handle successful upload
    }

    const handleUploadError = (error: string) => {
        console.error('Upload error:', error)
        // Handle upload error
    }

    return (
        <DocumentUpload
            clientId="your-client-id"
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
            maxFiles={10}
            maxFileSize={10}
        />
    )
}`}
                    </pre>
                </CardContent>
            </Card>
        </div>
    )
}
