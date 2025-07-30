'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
    FileText, 
    CheckCircle2, 
    AlertTriangle, 
    Edit3, 
    Save, 
    X, 
    Eye,
    AlertCircle,
    Loader2,
    RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'

// TypeScript interfaces
interface ValidationError {
    field: string
    message: string
    severity: 'error' | 'warning'
}

interface ExtractedData {
    [key: string]: {
        value: string | number
        confidence: number
        field_type: 'text' | 'number' | 'date' | 'currency'
        label: string
    }
}

interface ExtractionResult {
    document_id: string
    file_url: string
    form_type: string
    confidence: number
    extracted_data: ExtractedData
    validation_errors: ValidationError[]
}

interface DocumentExtractionProps {
    documentId: string
    onSaveComplete?: (documentId: string) => void
    onError?: (error: string) => void
}

interface EditingField {
    fieldName: string
    value: string
    originalValue: string
}

// Constants
const CONFIDENCE_THRESHOLDS = {
    HIGH: 0.8,
    MEDIUM: 0.6,
    LOW: 0.4
}

export const DocumentExtraction: React.FC<DocumentExtractionProps> = ({
    documentId,
    onSaveComplete,
    onError
}) => {
    // State management
    const [extractionData, setExtractionData] = useState<ExtractionResult | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [editingField, setEditingField] = useState<EditingField | null>(null)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const [previewError, setPreviewError] = useState(false)

    // Fetch extraction data from API
    const fetchExtractionData = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/documents/${documentId}/extraction/`)
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Document not found or extraction not completed')
                }
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data: ExtractionResult = await response.json()
            setExtractionData(data)
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load extraction data'
            setError(errorMessage)
            onError?.(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }, [documentId, onError])

    // Save corrected data to API
    const saveCorrections = async () => {
        if (!extractionData || !hasUnsavedChanges) return

        setSaving(true)
        setError(null)

        try {
            const response = await fetch(`/api/documents/${documentId}/extraction/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    extracted_data: extractionData.extracted_data
                })
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            setHasUnsavedChanges(false)
            onSaveComplete?.(documentId)
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to save corrections'
            setError(errorMessage)
            onError?.(errorMessage)
        } finally {
            setSaving(false)
        }
    }

    // Handle field editing
    const startEditing = (fieldName: string, currentValue: string) => {
        setEditingField({
            fieldName,
            value: currentValue,
            originalValue: currentValue
        })
    }

    const cancelEditing = () => {
        setEditingField(null)
    }

    const saveFieldEdit = () => {
        if (!editingField || !extractionData) return

        const updatedData = { ...extractionData }
        updatedData.extracted_data[editingField.fieldName] = {
            ...updatedData.extracted_data[editingField.fieldName],
            value: editingField.value
        }

        setExtractionData(updatedData)
        setEditingField(null)
        setHasUnsavedChanges(true)
    }

    const updateEditingValue = (value: string) => {
        if (editingField) {
            setEditingField({ ...editingField, value })
        }
    }

    // Get confidence level styling
    const getConfidenceStyle = (confidence: number) => {
        if (confidence >= CONFIDENCE_THRESHOLDS.HIGH) {
            return 'text-green-600 bg-green-50 border-green-200'
        } else if (confidence >= CONFIDENCE_THRESHOLDS.MEDIUM) {
            return 'text-yellow-600 bg-yellow-50 border-yellow-200'
        } else {
            return 'text-red-600 bg-red-50 border-red-200'
        }
    }

    const getConfidenceIcon = (confidence: number) => {
        if (confidence >= CONFIDENCE_THRESHOLDS.HIGH) {
            return <CheckCircle2 className="w-4 h-4 text-green-600" />
        } else {
            return <AlertTriangle className="w-4 h-4 text-yellow-600" />
        }
    }

    // Check if field has validation errors
    const getFieldError = (fieldName: string): ValidationError | undefined => {
        return extractionData?.validation_errors.find(error => error.field === fieldName)
    }

    // Format field value based on type
    const formatFieldValue = (field: ExtractedData[string]): string => {
        if (field.field_type === 'currency' && typeof field.value === 'number') {
            return `$${field.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
        }
        return String(field.value)
    }

    // Load data on mount
    useEffect(() => {
        fetchExtractionData()
    }, [fetchExtractionData])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                    <p className="text-gray-600">Loading extraction results...</p>
                </div>
            </div>
        )
    }

    if (error && !extractionData) {
        return (
            <div className="p-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {error}
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={fetchExtractionData}
                            className="ml-4"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Retry
                        </Button>
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    if (!extractionData) {
        return (
            <div className="p-6 text-center">
                <p className="text-gray-600">No extraction data available</p>
            </div>
        )
    }

    return (
        <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
            {/* Error Alert */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Header with Form Classification */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <FileText className="w-6 h-6 text-blue-600" />
                            <div>
                                <CardTitle className="text-xl">Document Extraction Results</CardTitle>
                                <p className="text-sm text-gray-600">Document ID: {extractionData.document_id}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            {hasUnsavedChanges && (
                                <Badge variant="outline" className="text-orange-600 border-orange-300">
                                    Unsaved Changes
                                </Badge>
                            )}
                            <Button
                                onClick={saveCorrections}
                                disabled={!hasUnsavedChanges || isSaving}
                                className="flex items-center space-x-2"
                            >
                                {isSaving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                <span>{isSaving ? 'Saving...' : 'Save Corrections'}</span>
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label className="text-sm font-medium text-gray-600">Form Type</Label>
                            <p className="text-lg font-semibold">{extractionData.form_type}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-gray-600">Classification Confidence</Label>
                            <div className="flex items-center space-x-2 mt-1">
                                {getConfidenceIcon(extractionData.confidence)}
                                <span className="text-lg font-semibold">
                                    {(extractionData.confidence * 100).toFixed(1)}%
                                </span>
                            </div>
                            <Progress 
                                value={extractionData.confidence * 100} 
                                className="mt-2 h-2"
                            />
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-gray-600">Validation Status</Label>
                            <div className="flex items-center space-x-2 mt-1">
                                {extractionData.validation_errors.length === 0 ? (
                                    <>
                                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                                        <span className="text-green-600 font-medium">Valid</span>
                                    </>
                                ) : (
                                    <>
                                        <AlertTriangle className="w-5 h-5 text-red-600" />
                                        <span className="text-red-600 font-medium">
                                            {extractionData.validation_errors.length} Issues
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Document Preview */}
                <Card className="lg:sticky lg:top-4 lg:h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Eye className="w-5 h-5" />
                            <span>Document Preview</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                            {!previewError ? (
                                <iframe
                                    src={extractionData.file_url}
                                    className="w-full h-96 border-0"
                                    title="Document Preview"
                                    onError={() => setPreviewError(true)}
                                />
                            ) : (
                                <div className="h-96 flex items-center justify-center bg-gray-50">
                                    <div className="text-center">
                                        <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                        <p className="text-gray-600">Preview not available</p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                            className="mt-2"
                                        >
                                            <a href={extractionData.file_url} target="_blank" rel="noopener noreferrer">
                                                Open in New Tab
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Extracted Data */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Extracted Data</CardTitle>
                            <p className="text-sm text-gray-600">
                                Review and edit the extracted information. Fields with low confidence or validation errors are highlighted.
                            </p>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-96">
                                <div className="space-y-4">
                                    {Object.entries(extractionData.extracted_data).map(([fieldName, field]) => {
                                        const fieldError = getFieldError(fieldName)
                                        const isEditing = editingField?.fieldName === fieldName
                                        const isLowConfidence = field.confidence < CONFIDENCE_THRESHOLDS.MEDIUM

                                        return (
                                            <div key={fieldName} className="space-y-2">
                                                <div className={`
                                                    p-4 border rounded-lg transition-colors
                                                    ${fieldError ? 'border-red-300 bg-red-50' : 
                                                      isLowConfidence ? 'border-yellow-300 bg-yellow-50' : 
                                                      'border-gray-200 bg-white'}
                                                `}>
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex-1">
                                                            <Label className="text-sm font-medium">
                                                                {field.label}
                                                            </Label>
                                                            <div className="flex items-center space-x-2 mt-1">
                                                                <Badge 
                                                                    variant="outline" 
                                                                    className={`text-xs ${getConfidenceStyle(field.confidence)}`}
                                                                >
                                                                    {(field.confidence * 100).toFixed(0)}% confidence
                                                                </Badge>
                                                                {fieldError && (
                                                                    <Badge variant="destructive" className="text-xs">
                                                                        {fieldError.severity}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {!isEditing && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => startEditing(fieldName, String(field.value))}
                                                                className="p-2"
                                                            >
                                                                <Edit3 className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                    </div>

                                                    {isEditing ? (
                                                        <div className="space-y-2">
                                                            <Input
                                                                value={editingField.value}
                                                                onChange={(e) => updateEditingValue(e.target.value)}
                                                                className="w-full"
                                                                autoFocus
                                                            />
                                                            <div className="flex space-x-2">
                                                                <Button
                                                                    size="sm"
                                                                    onClick={saveFieldEdit}
                                                                    disabled={editingField.value === editingField.originalValue}
                                                                >
                                                                    <Save className="w-3 h-3 mr-1" />
                                                                    Save
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={cancelEditing}
                                                                >
                                                                    <X className="w-3 h-3 mr-1" />
                                                                    Cancel
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="mt-2">
                                                            <p className="text-lg font-medium">
                                                                {formatFieldValue(field)}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {fieldError && (
                                                        <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-sm text-red-700">
                                                            <strong>{fieldError.severity.toUpperCase()}:</strong> {fieldError.message}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    {/* Validation Errors Summary */}
                    {extractionData.validation_errors.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2 text-red-600">
                                    <AlertTriangle className="w-5 h-5" />
                                    <span>Validation Issues ({extractionData.validation_errors.length})</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {extractionData.validation_errors.map((error, index) => (
                                        <div key={index} className="flex items-start space-x-2 p-2 bg-red-50 border border-red-200 rounded">
                                            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-red-800">
                                                    {error.field}
                                                </p>
                                                <p className="text-sm text-red-600">
                                                    {error.message}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
