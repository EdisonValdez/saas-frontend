'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { 
    Upload, 
    File, 
    FileText, 
    Image as ImageIcon, 
    Eye, 
    Download, 
    Archive, 
    Trash2, 
    Filter, 
    Search, 
    MoreHorizontal,
    CheckCircle2,
    Clock,
    AlertCircle,
    X,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Calendar,
    RefreshCw,
    Loader2,
    Plus,
    Grid,
    List,
    FolderOpen
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// TypeScript interfaces
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
    metadata?: {
        pages?: number
        ocr_text?: string
        created_by?: string
        last_modified?: string
    }
}

interface UploadingFile {
    id: string
    file: File
    progress: number
    status: 'uploading' | 'completed' | 'error'
    error?: string
    documentId?: string
}

interface DocumentManagerProps {
    clientId?: string
    workspaceId: string
    onDocumentSelect?: (document: Document) => void
    onDocumentUpdate?: (document: Document) => void
    onError?: (error: string) => void
    maxFileSize?: number // in MB
    allowedTypes?: string[]
}

type SortField = 'filename' | 'upload_date' | 'status' | 'document_type' | 'file_size'
type SortDirection = 'asc' | 'desc'
type ViewMode = 'grid' | 'list'

const DOCUMENT_TYPE_COLORS = {
    'W-2': 'bg-blue-100 text-blue-800 border-blue-200',
    '1099-NEC': 'bg-green-100 text-green-800 border-green-200',
    '1099-MISC': 'bg-purple-100 text-purple-800 border-purple-200',
    'W-4': 'bg-orange-100 text-orange-800 border-orange-200',
    '1040': 'bg-red-100 text-red-800 border-red-200',
    'Schedule C': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Other': 'bg-gray-100 text-gray-800 border-gray-200'
}

const STATUS_STYLES = {
    pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
    processing: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Loader2 },
    completed: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2 },
    failed: { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle },
    archived: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Archive }
}

const ACCEPTED_FILE_TYPES = {
    'application/pdf': '.pdf',
    'image/jpeg': '.jpg,.jpeg',
    'image/png': '.png',
    'image/tiff': '.tiff,.tif',
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({
    clientId,
    workspaceId,
    onDocumentSelect,
    onDocumentUpdate,
    onError,
    maxFileSize = 10,
    allowedTypes = Object.keys(ACCEPTED_FILE_TYPES)
}) => {
    // State management
    const [documents, setDocuments] = useState<Document[]>([])
    const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isDragOver, setIsDragOver] = useState(false)
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)
    
    // Filtering and sorting
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [typeFilter, setTypeFilter] = useState<string>('all')
    const [sortField, setSortField] = useState<SortField>('upload_date')
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
    const [viewMode, setViewMode] = useState<ViewMode>('list')
    
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Fetch documents
    const fetchDocuments = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            const params = new URLSearchParams({
                workspace: workspaceId,
                ...(clientId && { client_id: clientId })
            })

            const response = await fetch(`/api/documents/list/?${params}`)
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()
            setDocuments(data.documents || [])

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load documents'
            setError(errorMessage)
            onError?.(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }, [workspaceId, clientId, onError])

    // Handle file upload
    const handleFiles = useCallback(async (files: FileList | File[]) => {
        const fileArray = Array.from(files)
        
        for (const file of fileArray) {
            // Validate file
            if (!allowedTypes.includes(file.type)) {
                onError?.(`Invalid file type: ${file.type}`)
                continue
            }

            if (file.size > maxFileSize * 1024 * 1024) {
                onError?.(`File size exceeds ${maxFileSize}MB limit: ${file.name}`)
                continue
            }

            const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            
            const uploadingFile: UploadingFile = {
                id: uploadId,
                file,
                progress: 0,
                status: 'uploading'
            }

            setUploadingFiles(prev => [...prev, uploadingFile])

            // Start upload
            try {
                await uploadFile(uploadingFile)
            } catch (error) {
                console.error('Upload failed:', error)
            }
        }
    }, [allowedTypes, maxFileSize, onError])

    // Upload file to server
    const uploadFile = async (uploadingFile: UploadingFile) => {
        const formData = new FormData()
        formData.append('file', uploadingFile.file)
        formData.append('workspace', workspaceId)
        if (clientId) formData.append('client_id', clientId)

        try {
            // Simulate progress updates
            const progressInterval = setInterval(() => {
                setUploadingFiles(prev => 
                    prev.map(f => 
                        f.id === uploadingFile.id 
                            ? { ...f, progress: Math.min(f.progress + 10, 90) }
                            : f
                    )
                )
            }, 200)

            const response = await fetch('/api/documents/upload/', {
                method: 'POST',
                body: formData
            })

            clearInterval(progressInterval)

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const result = await response.json()

            // Update uploading file status
            setUploadingFiles(prev => 
                prev.map(f => 
                    f.id === uploadingFile.id 
                        ? { ...f, progress: 100, status: 'completed', documentId: result.document_id }
                        : f
                )
            )

            // Refresh documents list
            setTimeout(() => {
                fetchDocuments()
                // Remove from uploading list after a delay
                setUploadingFiles(prev => prev.filter(f => f.id !== uploadingFile.id))
            }, 1000)

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Upload failed'
            
            setUploadingFiles(prev => 
                prev.map(f => 
                    f.id === uploadingFile.id 
                        ? { ...f, status: 'error', error: errorMessage }
                        : f
                )
            )

            onError?.(errorMessage)
        }
    }

    // Handle drag and drop
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
        
        const files = e.dataTransfer.files
        if (files.length > 0) {
            handleFiles(files)
        }
    }, [handleFiles])

    // Handle file input change
    const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files && files.length > 0) {
            handleFiles(files)
        }
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }, [handleFiles])

    // Document actions
    const handleDocumentAction = async (action: string, document: Document) => {
        try {
            let endpoint = ''
            let method = 'POST'

            switch (action) {
                case 'archive':
                    endpoint = `/api/documents/${document.id}/archive/`
                    break
                case 'delete':
                    endpoint = `/api/documents/${document.id}/`
                    method = 'DELETE'
                    break
                case 'reprocess':
                    endpoint = `/api/documents/${document.id}/reprocess/`
                    break
                default:
                    return
            }

            const response = await fetch(endpoint, { method })
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            // Refresh documents
            fetchDocuments()
            onDocumentUpdate?.(document)

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : `Failed to ${action} document`
            onError?.(errorMessage)
        }
    }

    // Sorting and filtering
    const filteredAndSortedDocuments = React.useMemo(() => {
        let filtered = documents.filter(doc => {
            const matchesSearch = doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                doc.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                doc.document_type?.toLowerCase().includes(searchTerm.toLowerCase())
            
            const matchesStatus = statusFilter === 'all' || doc.status === statusFilter
            const matchesType = typeFilter === 'all' || doc.document_type === typeFilter

            return matchesSearch && matchesStatus && matchesType
        })

        // Sort documents
        filtered.sort((a, b) => {
            let aValue: any
            let bValue: any

            switch (sortField) {
                case 'filename':
                    aValue = a.filename.toLowerCase()
                    bValue = b.filename.toLowerCase()
                    break
                case 'upload_date':
                    aValue = new Date(a.upload_date).getTime()
                    bValue = new Date(b.upload_date).getTime()
                    break
                case 'status':
                    aValue = a.status
                    bValue = b.status
                    break
                case 'document_type':
                    aValue = a.document_type || 'zzz'
                    bValue = b.document_type || 'zzz'
                    break
                case 'file_size':
                    aValue = a.file_size
                    bValue = b.file_size
                    break
                default:
                    aValue = a.upload_date
                    bValue = b.upload_date
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
            return 0
        })

        return filtered
    }, [documents, searchTerm, statusFilter, typeFilter, sortField, sortDirection])

    // Handle sorting
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDirection('asc')
        }
    }

    // Get sort icon
    const getSortIcon = (field: SortField) => {
        if (sortField !== field) {
            return <ArrowUpDown className="w-4 h-4 text-gray-400" />
        }
        return sortDirection === 'asc' ? 
            <ArrowUp className="w-4 h-4 text-blue-600" /> : 
            <ArrowDown className="w-4 h-4 text-blue-600" />
    }

    // Format file size
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    // Get file icon
    const getFileIcon = (fileType: string) => {
        if (fileType === 'application/pdf') {
            return <FileText className="w-6 h-6 text-red-500" />
        }
        return <ImageIcon className="w-6 h-6 text-blue-500" />
    }

    // Load documents on mount
    useEffect(() => {
        fetchDocuments()
    }, [fetchDocuments])

    return (
        <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Document Manager</h1>
                    <p className="text-gray-600 mt-1">
                        Upload, manage, and organize tax documents
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchDocuments}
                        disabled={isLoading}
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button onClick={() => fileInputRef.current?.click()}>
                        <Plus className="w-4 h-4 mr-2" />
                        Upload Documents
                    </Button>
                </div>
            </div>

            {/* Upload Area */}
            <Card>
                <CardContent className="p-6">
                    <div
                        className={`
                            border-2 border-dashed rounded-lg p-8 text-center transition-colors
                            ${isDragOver 
                                ? 'border-primary bg-primary/10' 
                                : 'border-gray-300 hover:border-gray-400'
                            }
                            cursor-pointer
                        `}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold mb-2">Upload Tax Documents</h3>
                        <p className="text-gray-600 mb-4">
                            Drag and drop your files here, or click to select files
                        </p>
                        <p className="text-sm text-gray-500">
                            Supported formats: PDF, JPG, PNG, TIFF • Max size: {maxFileSize}MB
                        </p>
                        
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept={Object.values(ACCEPTED_FILE_TYPES).join(',')}
                            onChange={handleFileInputChange}
                            className="hidden"
                        />
                    </div>

                    {/* Upload Progress */}
                    {uploadingFiles.length > 0 && (
                        <div className="mt-6 space-y-3">
                            <h4 className="font-medium">Uploading Files</h4>
                            {uploadingFiles.map((file) => (
                                <div key={file.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-shrink-0">
                                        {getFileIcon(file.file.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{file.file.name}</p>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <Progress value={file.progress} className="flex-1 h-2" />
                                            <span className="text-xs text-gray-500">{file.progress}%</span>
                                        </div>
                                        {file.error && (
                                            <p className="text-xs text-red-500 mt-1">{file.error}</p>
                                        )}
                                    </div>
                                    {file.status === 'completed' && (
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    )}
                                    {file.status === 'error' && (
                                        <AlertCircle className="w-5 h-5 text-red-500" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Error Alert */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Filters and Controls */}
            <Card>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <div className="relative">
                            <Label htmlFor="search">Search</Label>
                            <div className="relative mt-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    id="search"
                                    placeholder="Search documents..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <Label>Status</Label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="processing">Processing</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="failed">Failed</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Document Type</Label>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="W-2">W-2</SelectItem>
                                    <SelectItem value="1099-NEC">1099-NEC</SelectItem>
                                    <SelectItem value="1099-MISC">1099-MISC</SelectItem>
                                    <SelectItem value="W-4">W-4</SelectItem>
                                    <SelectItem value="1040">1040</SelectItem>
                                    <SelectItem value="Schedule C">Schedule C</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>View Mode</Label>
                            <div className="flex mt-1">
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setViewMode('list')}
                                    className="rounded-r-none"
                                >
                                    <List className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                    className="rounded-l-none"
                                >
                                    <Grid className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                            <Filter className="w-4 h-4 mr-2" />
                            {filteredAndSortedDocuments.length} of {documents.length} documents
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Document List */}
            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center p-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            <span className="ml-2 text-gray-600">Loading documents...</span>
                        </div>
                    ) : filteredAndSortedDocuments.length === 0 ? (
                        <div className="text-center p-12">
                            <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
                            <p className="text-gray-600">
                                {documents.length === 0 
                                    ? 'Upload your first document to get started.' 
                                    : 'Try adjusting your filters or search term.'}
                            </p>
                        </div>
                    ) : viewMode === 'list' ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            className="h-auto p-0 font-medium"
                                            onClick={() => handleSort('filename')}
                                        >
                                            Document
                                            {getSortIcon('filename')}
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            className="h-auto p-0 font-medium"
                                            onClick={() => handleSort('document_type')}
                                        >
                                            Type
                                            {getSortIcon('document_type')}
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            className="h-auto p-0 font-medium"
                                            onClick={() => handleSort('status')}
                                        >
                                            Status
                                            {getSortIcon('status')}
                                        </Button>
                                    </TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            className="h-auto p-0 font-medium"
                                            onClick={() => handleSort('file_size')}
                                        >
                                            Size
                                            {getSortIcon('file_size')}
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            className="h-auto p-0 font-medium"
                                            onClick={() => handleSort('upload_date')}
                                        >
                                            Upload Date
                                            {getSortIcon('upload_date')}
                                        </Button>
                                    </TableHead>
                                    <TableHead className="w-[50px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAndSortedDocuments.map((document) => {
                                    const StatusIcon = STATUS_STYLES[document.status].icon
                                    return (
                                        <TableRow key={document.id} className="hover:bg-gray-50">
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    {getFileIcon(document.file_type)}
                                                    <div>
                                                        <p className="font-medium text-gray-900 truncate max-w-xs">
                                                            {document.filename}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {document.file_type}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {document.document_type ? (
                                                    <Badge 
                                                        variant="outline" 
                                                        className={DOCUMENT_TYPE_COLORS[document.document_type]}
                                                    >
                                                        {document.document_type}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <StatusIcon className={`w-4 h-4 ${
                                                        document.status === 'processing' ? 'animate-spin' : ''
                                                    }`} />
                                                    <Badge 
                                                        variant="outline" 
                                                        className={STATUS_STYLES[document.status].color}
                                                    >
                                                        {document.status}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {document.client_name || <span className="text-gray-400">-</span>}
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-500">
                                                {formatFileSize(document.file_size)}
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-500">
                                                {new Date(document.upload_date).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem 
                                                            onClick={() => {
                                                                setSelectedDocument(document)
                                                                setIsPreviewOpen(true)
                                                                onDocumentSelect?.(document)
                                                            }}
                                                        >
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            Preview
                                                        </DropdownMenuItem>
                                                        {document.file_url && (
                                                            <DropdownMenuItem asChild>
                                                                <a 
                                                                    href={document.file_url} 
                                                                    download={document.filename}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    <Download className="w-4 h-4 mr-2" />
                                                                    Download
                                                                </a>
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuSeparator />
                                                        {document.status === 'failed' && (
                                                            <DropdownMenuItem 
                                                                onClick={() => handleDocumentAction('reprocess', document)}
                                                            >
                                                                <RefreshCw className="w-4 h-4 mr-2" />
                                                                Reprocess
                                                            </DropdownMenuItem>
                                                        )}
                                                        {document.status !== 'archived' && (
                                                            <DropdownMenuItem 
                                                                onClick={() => handleDocumentAction('archive', document)}
                                                            >
                                                                <Archive className="w-4 h-4 mr-2" />
                                                                Archive
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem 
                                                            onClick={() => handleDocumentAction('delete', document)}
                                                            className="text-red-600"
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    ) : (
                        // Grid View
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredAndSortedDocuments.map((document) => {
                                const StatusIcon = STATUS_STYLES[document.status].icon
                                return (
                                    <Card key={document.id} className="hover:shadow-md transition-shadow cursor-pointer">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center space-x-2">
                                                    {getFileIcon(document.file_type)}
                                                    <StatusIcon className={`w-4 h-4 ${
                                                        document.status === 'processing' ? 'animate-spin' : ''
                                                    }`} />
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem 
                                                            onClick={() => {
                                                                setSelectedDocument(document)
                                                                setIsPreviewOpen(true)
                                                                onDocumentSelect?.(document)
                                                            }}
                                                        >
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            Preview
                                                        </DropdownMenuItem>
                                                        {document.file_url && (
                                                            <DropdownMenuItem asChild>
                                                                <a 
                                                                    href={document.file_url} 
                                                                    download={document.filename}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    <Download className="w-4 h-4 mr-2" />
                                                                    Download
                                                                </a>
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuSeparator />
                                                        {document.status !== 'archived' && (
                                                            <DropdownMenuItem 
                                                                onClick={() => handleDocumentAction('archive', document)}
                                                            >
                                                                <Archive className="w-4 h-4 mr-2" />
                                                                Archive
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem 
                                                            onClick={() => handleDocumentAction('delete', document)}
                                                            className="text-red-600"
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            
                                            <h3 className="font-medium text-sm truncate mb-2" title={document.filename}>
                                                {document.filename}
                                            </h3>
                                            
                                            <div className="space-y-2">
                                                {document.document_type && (
                                                    <Badge 
                                                        variant="outline" 
                                                        className={`text-xs ${DOCUMENT_TYPE_COLORS[document.document_type]}`}
                                                    >
                                                        {document.document_type}
                                                    </Badge>
                                                )}
                                                
                                                <Badge 
                                                    variant="outline" 
                                                    className={`text-xs ${STATUS_STYLES[document.status].color}`}
                                                >
                                                    {document.status}
                                                </Badge>
                                                
                                                <div className="text-xs text-gray-500 space-y-1">
                                                    <div>{formatFileSize(document.file_size)}</div>
                                                    <div>{new Date(document.upload_date).toLocaleDateString()}</div>
                                                    {document.client_name && (
                                                        <div className="truncate">{document.client_name}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Document Preview Modal */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-w-4xl h-[80vh]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <span>Document Preview</span>
                            {selectedDocument && (
                                <Badge 
                                    variant="outline" 
                                    className={selectedDocument.document_type ? 
                                        DOCUMENT_TYPE_COLORS[selectedDocument.document_type] : 
                                        'bg-gray-100 text-gray-800'
                                    }
                                >
                                    {selectedDocument.document_type || 'Unknown Type'}
                                </Badge>
                            )}
                        </DialogTitle>
                    </DialogHeader>
                    
                    {selectedDocument && (
                        <div className="flex-1 overflow-hidden">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                                {/* Document Preview */}
                                <div className="lg:col-span-2 bg-gray-100 rounded-lg flex items-center justify-center">
                                    {selectedDocument.file_url ? (
                                        selectedDocument.file_type === 'application/pdf' ? (
                                            <iframe
                                                src={selectedDocument.file_url}
                                                className="w-full h-full border-0 rounded-lg"
                                                title="Document Preview"
                                            />
                                        ) : (
                                            <img
                                                src={selectedDocument.file_url}
                                                alt={selectedDocument.filename}
                                                className="max-w-full max-h-full object-contain rounded-lg"
                                            />
                                        )
                                    ) : (
                                        <div className="text-center text-gray-500">
                                            <FileText className="w-12 h-12 mx-auto mb-2" />
                                            <p>Preview not available</p>
                                        </div>
                                    )}
                                </div>

                                {/* Document Details */}
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-medium mb-2">Document Information</h3>
                                        <div className="space-y-2 text-sm">
                                            <div>
                                                <span className="text-gray-600">Filename:</span>
                                                <p className="break-all">{selectedDocument.filename}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Type:</span>
                                                <p>{selectedDocument.document_type || 'Not classified'}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Status:</span>
                                                <p className="capitalize">{selectedDocument.status}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Size:</span>
                                                <p>{formatFileSize(selectedDocument.file_size)}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Upload Date:</span>
                                                <p>{new Date(selectedDocument.upload_date).toLocaleString()}</p>
                                            </div>
                                            {selectedDocument.client_name && (
                                                <div>
                                                    <span className="text-gray-600">Client:</span>
                                                    <p>{selectedDocument.client_name}</p>
                                                </div>
                                            )}
                                            {selectedDocument.extraction_confidence && (
                                                <div>
                                                    <span className="text-gray-600">Extraction Confidence:</span>
                                                    <p>{(selectedDocument.extraction_confidence * 100).toFixed(1)}%</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {selectedDocument.tags && selectedDocument.tags.length > 0 && (
                                        <div>
                                            <h3 className="font-medium mb-2">Tags</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedDocument.tags.map((tag, index) => (
                                                    <Badge key={index} variant="secondary" className="text-xs">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {selectedDocument.error_message && (
                                        <div>
                                            <h3 className="font-medium mb-2 text-red-600">Error Details</h3>
                                            <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                                                {selectedDocument.error_message}
                                            </p>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        {selectedDocument.file_url && (
                                            <Button asChild className="w-full">
                                                <a 
                                                    href={selectedDocument.file_url} 
                                                    download={selectedDocument.filename}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <Download className="w-4 h-4 mr-2" />
                                                    Download
                                                </a>
                                            </Button>
                                        )}
                                        
                                        {selectedDocument.status === 'failed' && (
                                            <Button 
                                                variant="outline" 
                                                className="w-full"
                                                onClick={() => {
                                                    handleDocumentAction('reprocess', selectedDocument)
                                                    setIsPreviewOpen(false)
                                                }}
                                            >
                                                <RefreshCw className="w-4 h-4 mr-2" />
                                                Reprocess
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
