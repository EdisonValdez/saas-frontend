'use client'

import React, { useState, useCallback, useRef } from 'react'
import { Upload, X, FileText, Image, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'

// TypeScript interfaces for the component
interface UploadedFile {
    file: File
    id: string
    preview?: string
    status: 'pending' | 'uploading' | 'completed' | 'error'
    error?: string
    documentId?: string
}

interface DocumentUploadProps {
    clientId: string
    onUploadComplete?: (documentIds: string[]) => void
    onUploadError?: (error: string) => void
    maxFiles?: number
    maxFileSize?: number // in MB
}

interface ApiResponse {
    document_id: string
    status: 'pending'
}

const ACCEPTED_FILE_TYPES = {
    'application/pdf': '.pdf',
    'image/jpeg': '.jpg,.jpeg',
    'image/png': '.png',
    'image/tiff': '.tiff,.tif',
}

const MAX_FILE_SIZE_MB = 10
const MAX_FILES = 10

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
    clientId,
    onUploadComplete,
    onUploadError,
    maxFiles = MAX_FILES,
    maxFileSize = MAX_FILE_SIZE_MB,
}) => {
    const [files, setFiles] = useState<UploadedFile[]>([])
    const [isDragOver, setIsDragOver] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Generate unique ID for files
    const generateFileId = () => `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Validate file type and size
    const validateFile = (file: File): string | null => {
        // Check file type
        if (!Object.keys(ACCEPTED_FILE_TYPES).includes(file.type)) {
            return `Invalid file type. Accepted formats: PDF, JPG, PNG, TIFF`
        }

        // Check file size
        if (file.size > maxFileSize * 1024 * 1024) {
            return `File size exceeds ${maxFileSize}MB limit`
        }

        return null
    }

    // Create preview for image files
    const createPreview = (file: File): Promise<string | undefined> => {
        return new Promise((resolve) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader()
                reader.onload = (e) => resolve(e.target?.result as string)
                reader.readAsDataURL(file)
            } else {
                resolve(undefined)
            }
        })
    }

    // Handle file selection
    const handleFiles = useCallback(async (selectedFiles: FileList | File[]) => {
        const fileArray = Array.from(selectedFiles)
        
        // Check if adding these files would exceed the limit
        if (files.length + fileArray.length > maxFiles) {
            onUploadError?.(`Cannot upload more than ${maxFiles} files`)
            return
        }

        const newFiles: UploadedFile[] = []

        for (const file of fileArray) {
            const validationError = validateFile(file)
            if (validationError) {
                newFiles.push({
                    file,
                    id: generateFileId(),
                    status: 'error',
                    error: validationError,
                })
            } else {
                const preview = await createPreview(file)
                newFiles.push({
                    file,
                    id: generateFileId(),
                    preview,
                    status: 'pending',
                })
            }
        }

        setFiles(prev => [...prev, ...newFiles])
    }, [files.length, maxFiles, maxFileSize, onUploadError])

    // Handle drag events
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
        
        const droppedFiles = e.dataTransfer.files
        if (droppedFiles.length > 0) {
            handleFiles(droppedFiles)
        }
    }, [handleFiles])

    // Handle file input change
    const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files
        if (selectedFiles && selectedFiles.length > 0) {
            handleFiles(selectedFiles)
        }
        // Reset input value to allow selecting the same file again
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }, [handleFiles])

    // Remove file from the list
    const removeFile = useCallback((fileId: string) => {
        setFiles(prev => prev.filter(file => file.id !== fileId))
    }, [])

    // Upload a single file to the API
    const uploadFile = async (uploadedFile: UploadedFile): Promise<void> => {
        const formData = new FormData()
        formData.append('file', uploadedFile.file)
        formData.append('client_id', clientId)

        try {
            const response = await fetch('/api/documents/', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Upload failed' }))
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
            }

            const result: ApiResponse = await response.json()
            
            // Update file status to completed
            setFiles(prev => prev.map(f => 
                f.id === uploadedFile.id 
                    ? { ...f, status: 'completed', documentId: result.document_id }
                    : f
            ))

            return Promise.resolve()
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
            
            // Update file status to error
            setFiles(prev => prev.map(f => 
                f.id === uploadedFile.id 
                    ? { ...f, status: 'error', error: errorMessage }
                    : f
            ))

            throw error
        }
    }

    // Upload all pending files
    const handleUpload = async () => {
        const pendingFiles = files.filter(f => f.status === 'pending')
        
        if (pendingFiles.length === 0) {
            onUploadError?.('No files to upload')
            return
        }

        setIsUploading(true)
        setUploadProgress(0)

        // Set all pending files to uploading status
        setFiles(prev => prev.map(f => 
            f.status === 'pending' ? { ...f, status: 'uploading' } : f
        ))

        const uploadPromises = pendingFiles.map(async (file, index) => {
            try {
                await uploadFile(file)
                // Update progress
                const progress = ((index + 1) / pendingFiles.length) * 100
                setUploadProgress(progress)
            } catch (error) {
                console.error(`Failed to upload ${file.file.name}:`, error)
            }
        })

        try {
            await Promise.all(uploadPromises)
            
            // Get successfully uploaded document IDs
            const completedFiles = files.filter(f => f.status === 'completed')
            const documentIds = completedFiles
                .map(f => f.documentId)
                .filter((id): id is string => id !== undefined)
            
            if (documentIds.length > 0) {
                onUploadComplete?.(documentIds)
            }
            
        } catch (error) {
            onUploadError?.('Some files failed to upload')
        } finally {
            setIsUploading(false)
            setUploadProgress(0)
        }
    }

    // Get file type icon
    const getFileIcon = (file: File) => {
        if (file.type === 'application/pdf') {
            return <FileText className="w-8 h-8 text-red-500" />
        }
        return <Image className="w-8 h-8 text-blue-500" />
    }

    // Get status icon
    const getStatusIcon = (status: UploadedFile['status']) => {
        switch (status) {
            case 'uploading':
                return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            case 'completed':
                return <CheckCircle2 className="w-4 h-4 text-green-500" />
            case 'error':
                return <AlertCircle className="w-4 h-4 text-red-500" />
            default:
                return null
        }
    }

    const pendingFilesCount = files.filter(f => f.status === 'pending').length
    const hasErrors = files.some(f => f.status === 'error')

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
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
                            ${isUploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
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
                            Supported formats: PDF, JPG, PNG, TIFF • Max size: {maxFileSize}MB • Max files: {maxFiles}
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
                </CardContent>
            </Card>

            {/* Upload Progress */}
            {isUploading && (
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                            <div className="flex-1">
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Uploading documents...</span>
                                    <span>{Math.round(uploadProgress)}%</span>
                                </div>
                                <Progress value={uploadProgress} className="h-2" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* File List */}
            {files.length > 0 && (
                <Card>
                    <CardContent className="p-6">
                        <h4 className="text-lg font-semibold mb-4">Selected Files ({files.length})</h4>
                        <div className="space-y-3">
                            {files.map((uploadedFile) => (
                                <div
                                    key={uploadedFile.id}
                                    className="flex items-center space-x-4 p-3 border rounded-lg bg-gray-50"
                                >
                                    {/* File Icon */}
                                    <div className="flex-shrink-0">
                                        {getFileIcon(uploadedFile.file)}
                                    </div>

                                    {/* File Preview (for images) */}
                                    {uploadedFile.preview && (
                                        <div className="flex-shrink-0">
                                            <img
                                                src={uploadedFile.preview}
                                                alt="Preview"
                                                className="w-12 h-12 object-cover rounded border"
                                            />
                                        </div>
                                    )}

                                    {/* File Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {uploadedFile.file.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                        {uploadedFile.error && (
                                            <p className="text-xs text-red-500 mt-1">
                                                {uploadedFile.error}
                                            </p>
                                        )}
                                    </div>

                                    {/* Status */}
                                    <div className="flex items-center space-x-2">
                                        {getStatusIcon(uploadedFile.status)}
                                        <span className="text-xs text-gray-500 capitalize">
                                            {uploadedFile.status}
                                        </span>
                                    </div>

                                    {/* Remove Button */}
                                    {uploadedFile.status !== 'uploading' && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeFile(uploadedFile.id)}
                                            className="p-1 h-auto"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Error Alert */}
            {hasErrors && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Some files have errors. Please check the file list above and remove invalid files.
                    </AlertDescription>
                </Alert>
            )}

            {/* Upload Button */}
            {pendingFilesCount > 0 && (
                <div className="flex justify-end">
                    <Button
                        onClick={handleUpload}
                        disabled={isUploading || hasErrors}
                        size="lg"
                        className="px-8"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4 mr-2" />
                                Upload {pendingFilesCount} {pendingFilesCount === 1 ? 'Document' : 'Documents'}
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    )
}
