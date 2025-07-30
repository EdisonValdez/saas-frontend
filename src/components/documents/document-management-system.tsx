'use client'

import React, { useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { 
    Upload,
    FileText,
    Image,
    File,
    Eye,
    Download,
    Trash2,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    Clock,
    Loader2,
    Search,
    Filter,
    Calendar,
    MoreHorizontal,
    Zap,
    FileCheck,
    AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
    useClientDocuments, 
    useUploadDocument, 
    useDocument,
    useExtractedData,
    useWorkspaceClients
} from '@/lib/hooks/api-hooks'
import { DocumentData } from '@/lib/api-client'

interface DocumentManagementSystemProps {
    clientId?: string
    showClientSelector?: boolean
}

const FILE_TYPE_ICONS = {
    pdf: FileText,
    image: Image,
    default: File
}

const STATUS_COLORS = {
    uploaded: 'bg-blue-100 text-blue-800',
    processing: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800'
}

const STATUS_ICONS = {
    uploaded: Clock,
    processing: Loader2,
    completed: CheckCircle2,
    error: AlertCircle
}

export function DocumentManagementSystem({ 
    clientId: initialClientId, 
    showClientSelector = false 
}: DocumentManagementSystemProps) {
    const params = useParams<{ workspaceId: string }>()
    const workspaceId = params.workspaceId

    // State management
    const [selectedClientId, setSelectedClientId] = useState(initialClientId || '')
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all' | DocumentData['status']>('all')
    const [typeFilter, setTypeFilter] = useState<'all' | 'pdf' | 'image' | 'other'>('all')
    const [selectedDocument, setSelectedDocument] = useState<DocumentData | null>(null)
    const [showUploadDialog, setShowUploadDialog] = useState(false)
    const [uploadFiles, setUploadFiles] = useState<File[]>([])

    // API hooks
    const { data: clientsData } = useWorkspaceClients(workspaceId)
    const { data: documentsData, isLoading: documentsLoading, refetch: refetchDocuments } = useClientDocuments(selectedClientId)
    const { data: selectedDocumentData } = useDocument(selectedClientId, selectedDocument?.id || '')
    const { data: extractedData } = useExtractedData(selectedClientId, selectedDocument?.id || '')
    const uploadDocumentMutation = useUploadDocument(selectedClientId)

    const clients = clientsData?.clients || []
    const documents = documentsData?.documents || []

    // Dropzone configuration
    const onDrop = useCallback((acceptedFiles: File[]) => {
        setUploadFiles(acceptedFiles)
        setShowUploadDialog(true)
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff']
        },
        maxSize: 50 * 1024 * 1024, // 50MB
        disabled: !selectedClientId
    })

    // Filter documents
    const filteredDocuments = documents.filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === 'all' || doc.status === statusFilter
        const matchesType = typeFilter === 'all' || getDocumentType(doc.type) === typeFilter
        return matchesSearch && matchesStatus && matchesType
    })

    const getDocumentType = (mimeType: string): 'pdf' | 'image' | 'other' => {
        if (mimeType.includes('pdf')) return 'pdf'
        if (mimeType.includes('image')) return 'image'
        return 'other'
    }

    const getFileIcon = (type: string) => {
        const docType = getDocumentType(type)
        const Icon = FILE_TYPE_ICONS[docType] || FILE_TYPE_ICONS.default
        return Icon
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const handleUpload = async () => {
        if (!selectedClientId || uploadFiles.length === 0) return

        for (const file of uploadFiles) {
            try {
                await uploadDocumentMutation.mutateAsync({
                    file,
                    metadata: {
                        uploaded_by: 'current_user',
                        original_name: file.name
                    }
                })
            } catch (error) {
                console.error('Upload failed:', error)
            }
        }

        setUploadFiles([])
        setShowUploadDialog(false)
        refetchDocuments()
    }

    const DocumentCard = ({ document }: { document: DocumentData }) => {
        const Icon = getFileIcon(document.type)
        const StatusIcon = STATUS_ICONS[document.status]
        
        return (
            <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Icon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <CardTitle className="text-lg truncate">{document.name}</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    {formatFileSize(document.size)} • {formatDate(document.upload_date)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge className={STATUS_COLORS[document.status]}>
                                <StatusIcon className={`h-3 w-3 mr-1 ${document.status === 'processing' ? 'animate-spin' : ''}`} />
                                {document.status}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    {document.status === 'completed' && document.ocr_confidence && (
                        <div className="mb-3">
                            <div className="flex justify-between text-sm mb-1">
                                <span>OCR Confidence</span>
                                <span>{Math.round(document.ocr_confidence * 100)}%</span>
                            </div>
                            <Progress value={document.ocr_confidence * 100} className="h-2" />
                        </div>
                    )}
                    
                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setSelectedDocument(document)}
                        >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                        </Button>
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                        </Button>
                        {document.status === 'completed' && (
                            <Button variant="outline" size="sm">
                                <Zap className="h-4 w-4 mr-1" />
                                Extract
                            </Button>
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {document.status === 'error' && (
                                    <DropdownMenuItem>
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Retry Processing
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Document Management</h1>
                <p className="text-gray-600 mt-1">
                    Upload, process, and manage client documents with AI-powered OCR
                </p>
            </div>

            {/* Client Selector */}
            {showClientSelector && (
                <Card>
                    <CardHeader>
                        <CardTitle>Select Client</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a client to manage documents" />
                            </SelectTrigger>
                            <SelectContent>
                                {clients.map((client) => (
                                    <SelectItem key={client.id} value={client.id}>
                                        {client.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>
            )}

            {!selectedClientId && showClientSelector ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Client</h3>
                        <p className="text-gray-600">
                            Choose a client from the dropdown above to view and manage their documents.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Upload Area */}
                    <Card>
                        <CardContent className="p-6">
                            <div
                                {...getRootProps()}
                                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                                    isDragActive 
                                        ? 'border-blue-500 bg-blue-50' 
                                        : 'border-gray-300 hover:border-gray-400'
                                } ${!selectedClientId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                                <input {...getInputProps()} />
                                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {isDragActive ? 'Drop files here' : 'Upload Documents'}
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Drag and drop files here, or click to select files
                                </p>
                                <p className="text-sm text-gray-500">
                                    Supports PDF and image files up to 50MB
                                </p>
                                {!selectedClientId && showClientSelector && (
                                    <Alert className="mt-4">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertDescription>
                                            Please select a client before uploading documents.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Controls */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Search documents..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 w-80"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="uploaded">Uploaded</SelectItem>
                                        <SelectItem value="processing">Processing</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="error">Error</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="pdf">PDF</SelectItem>
                                        <SelectItem value="image">Images</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Button 
                            onClick={() => refetchDocuments()}
                            variant="outline"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                    </div>

                    {/* Document List */}
                    {documentsLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <span className="ml-2">Loading documents...</span>
                        </div>
                    ) : filteredDocuments.length === 0 ? (
                        <Card>
                            <CardContent className="text-center py-12">
                                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents found</h3>
                                <p className="text-gray-600 mb-4">
                                    {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                                        ? 'Try adjusting your filters or search terms.'
                                        : 'Upload your first document to get started.'}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredDocuments.map((document) => (
                                <DocumentCard key={document.id} document={document} />
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Upload Dialog */}
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Upload Documents</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            {uploadFiles.length} file(s) selected for upload
                        </p>
                        <ScrollArea className="max-h-48">
                            {uploadFiles.map((file, index) => (
                                <div key={index} className="flex items-center gap-3 py-2">
                                    <FileText className="h-4 w-4 text-blue-600" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{file.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatFileSize(file.size)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </ScrollArea>
                    </div>
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => {
                                setShowUploadDialog(false)
                                setUploadFiles([])
                            }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleUpload}
                            disabled={uploadDocumentMutation.isPending}
                        >
                            {uploadDocumentMutation.isPending ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Upload className="h-4 w-4 mr-2" />
                            )}
                            Upload
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Document Details Dialog */}
            {selectedDocument && (
                <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
                    <DialogContent className="max-w-4xl max-h-[80vh]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-3">
                                {React.createElement(getFileIcon(selectedDocument.type), {
                                    className: "h-5 w-5 text-blue-600"
                                })}
                                {selectedDocument.name}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[60vh] overflow-auto">
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-sm font-medium">Document Information</Label>
                                    <div className="mt-2 space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Status:</span>
                                            <Badge className={STATUS_COLORS[selectedDocument.status]}>
                                                {selectedDocument.status}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Size:</span>
                                            <span>{formatFileSize(selectedDocument.size)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Uploaded:</span>
                                            <span>{formatDate(selectedDocument.upload_date)}</span>
                                        </div>
                                        {selectedDocument.ocr_confidence && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">OCR Confidence:</span>
                                                <span>{Math.round(selectedDocument.ocr_confidence * 100)}%</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {extractedData && (
                                    <div>
                                        <Label className="text-sm font-medium">Extracted Data</Label>
                                        <ScrollArea className="h-48 mt-2">
                                            <pre className="text-xs bg-gray-50 p-3 rounded-md">
                                                {JSON.stringify(extractedData, null, 2)}
                                            </pre>
                                        </ScrollArea>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label className="text-sm font-medium">Document Preview</Label>
                                    <div className="mt-2 bg-gray-50 rounded-lg p-8 text-center">
                                        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                        <p className="text-sm text-muted-foreground">
                                            Preview not available
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Use the download button to view the full document
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setSelectedDocument(null)}>
                                Close
                            </Button>
                            <Button variant="outline">
                                <Download className="h-4 w-4 mr-2" />
                                Download
                            </Button>
                            {selectedDocument.status === 'completed' && (
                                <Button>
                                    <Zap className="h-4 w-4 mr-2" />
                                    Use with AI
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}
