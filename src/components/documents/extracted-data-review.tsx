'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { 
    Save, 
    X, 
    Edit3, 
    Check, 
    AlertTriangle, 
    Eye, 
    RefreshCw,
    Loader2,
    CheckCircle2,
    AlertCircle,
    DollarSign,
    User,
    Building,
    Calendar,
    FileText,
    Maximize2,
    Minimize2,
    RotateCcw,
    Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

// TypeScript interfaces
interface ExtractedField {
    id: string
    label: string
    value: string | number
    original_value: string | number
    confidence: number
    field_type: 'ssn' | 'ein' | 'currency' | 'percentage' | 'date' | 'text' | 'number'
    validation_rules?: {
        required?: boolean
        min_length?: number
        max_length?: number
        pattern?: string
        min_value?: number
        max_value?: number
    }
    coordinates?: {
        x: number
        y: number
        width: number
        height: number
        page?: number
    }
    is_modified?: boolean
    validation_error?: string
    custom_validation_message?: string
}

interface ExtractedData {
    document_id: string
    document_type: 'W-2' | '1099-NEC' | '1099-MISC' | 'W-4' | '1040' | 'Schedule C' | 'Other'
    extraction_date: string
    confidence_score: number
    status: 'pending_review' | 'reviewed' | 'approved' | 'rejected'
    fields: Record<string, ExtractedField>
    validation_errors: string[]
    file_url: string
    thumbnail_url?: string
    metadata?: {
        pages: number
        processing_time: number
        ocr_engine: string
        model_version: string
    }
}

interface ExtractedDataReviewProps {
    documentId: string
    onSave?: (data: ExtractedData) => void
    onSubmit?: (data: ExtractedData) => void
    onError?: (error: string) => void
    readOnly?: boolean
}

// Tax-specific validation patterns
const VALIDATION_PATTERNS = {
    ssn: /^\d{3}-\d{2}-\d{4}$/,
    ein: /^\d{2}-\d{7}$/,
    currency: /^\$?[\d,]+\.?\d{0,2}$/,
    percentage: /^\d{1,3}(\.\d{1,2})?%?$/,
    date: /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/,
    zip: /^\d{5}(-\d{4})?$/
}

// Form field configurations for different document types
const FORM_CONFIGS = {
    'W-2': {
        employee_info: {
            label: 'Employee Information',
            fields: ['employee_name', 'employee_ssn', 'employee_address']
        },
        employer_info: {
            label: 'Employer Information', 
            fields: ['employer_name', 'employer_ein', 'employer_address']
        },
        wage_info: {
            label: 'Wage and Tax Information',
            fields: ['wages_tips', 'federal_tax_withheld', 'social_security_wages', 'social_security_tax', 'medicare_wages', 'medicare_tax']
        }
    },
    '1099-NEC': {
        payer_info: {
            label: 'Payer Information',
            fields: ['payer_name', 'payer_tin', 'payer_address']
        },
        recipient_info: {
            label: 'Recipient Information',
            fields: ['recipient_name', 'recipient_ssn', 'recipient_address']
        },
        payment_info: {
            label: 'Payment Information',
            fields: ['nonemployee_compensation', 'federal_tax_withheld']
        }
    },
    '1099-MISC': {
        payer_info: {
            label: 'Payer Information',
            fields: ['payer_name', 'payer_tin', 'payer_address']
        },
        recipient_info: {
            label: 'Recipient Information',
            fields: ['recipient_name', 'recipient_ssn', 'recipient_address']
        },
        income_info: {
            label: 'Income Information',
            fields: ['rents', 'royalties', 'other_income', 'federal_tax_withheld']
        }
    }
}

export const ExtractedDataReview: React.FC<ExtractedDataReviewProps> = ({
    documentId,
    onSave,
    onSubmit,
    onError,
    readOnly = false
}) => {
    // State management
    const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [editingField, setEditingField] = useState<string | null>(null)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const [isDocumentExpanded, setIsDocumentExpanded] = useState(false)
    const [highlightedField, setHighlightedField] = useState<string | null>(null)
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
    
    const documentRef = useRef<HTMLIFrameElement>(null)

    // Fetch extracted data
    const fetchExtractedData = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/documents/${documentId}/extracted-data/`)
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data: ExtractedData = await response.json()
            setExtractedData(data)

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load extracted data'
            setError(errorMessage)
            onError?.(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }, [documentId, onError])

    // Validate individual field
    const validateField = (field: ExtractedField): string | null => {
        const value = String(field.value).trim()

        // Check if required field is empty
        if (field.validation_rules?.required && !value) {
            return 'This field is required'
        }

        // Skip validation for empty optional fields
        if (!value && !field.validation_rules?.required) {
            return null
        }

        // Type-specific validation
        switch (field.field_type) {
            case 'ssn':
                if (!VALIDATION_PATTERNS.ssn.test(value)) {
                    return 'SSN must be in format XXX-XX-XXXX'
                }
                break
            
            case 'ein':
                if (!VALIDATION_PATTERNS.ein.test(value)) {
                    return 'EIN must be in format XX-XXXXXXX'
                }
                break
            
            case 'currency':
                const currencyValue = parseFloat(value.replace(/[$,]/g, ''))
                if (isNaN(currencyValue)) {
                    return 'Invalid currency format'
                }
                if (field.validation_rules?.min_value !== undefined && currencyValue < field.validation_rules.min_value) {
                    return `Value must be at least $${field.validation_rules.min_value}`
                }
                if (field.validation_rules?.max_value !== undefined && currencyValue > field.validation_rules.max_value) {
                    return `Value must not exceed $${field.validation_rules.max_value}`
                }
                break
            
            case 'percentage':
                const percentValue = parseFloat(value.replace('%', ''))
                if (isNaN(percentValue) || percentValue < 0 || percentValue > 100) {
                    return 'Percentage must be between 0 and 100'
                }
                break
            
            case 'date':
                if (!VALIDATION_PATTERNS.date.test(value)) {
                    return 'Date must be in format MM/DD/YYYY'
                }
                break
            
            case 'text':
                if (field.validation_rules?.min_length && value.length < field.validation_rules.min_length) {
                    return `Minimum length is ${field.validation_rules.min_length} characters`
                }
                if (field.validation_rules?.max_length && value.length > field.validation_rules.max_length) {
                    return `Maximum length is ${field.validation_rules.max_length} characters`
                }
                if (field.validation_rules?.pattern && !new RegExp(field.validation_rules.pattern).test(value)) {
                    return field.custom_validation_message || 'Invalid format'
                }
                break
        }

        return null
    }

    // Validate all fields
    const validateAllFields = useCallback(() => {
        if (!extractedData) return {}

        const errors: Record<string, string> = {}
        
        Object.entries(extractedData.fields).forEach(([fieldId, field]) => {
            const error = validateField(field)
            if (error) {
                errors[fieldId] = error
            }
        })

        setValidationErrors(errors)
        return errors
    }, [extractedData])

    // Handle field value change
    const handleFieldChange = (fieldId: string, newValue: string | number) => {
        if (!extractedData) return

        const updatedData = { ...extractedData }
        updatedData.fields[fieldId] = {
            ...updatedData.fields[fieldId],
            value: newValue,
            is_modified: newValue !== updatedData.fields[fieldId].original_value
        }

        setExtractedData(updatedData)
        setHasUnsavedChanges(true)

        // Validate the changed field
        const error = validateField(updatedData.fields[fieldId])
        setValidationErrors(prev => ({
            ...prev,
            [fieldId]: error || ''
        }))
    }

    // Save changes
    const handleSave = async () => {
        if (!extractedData) return

        const errors = validateAllFields()
        if (Object.keys(errors).some(key => errors[key])) {
            onError?.('Please fix validation errors before saving')
            return
        }

        setIsSaving(true)
        try {
            const response = await fetch(`/api/documents/${documentId}/extracted-data/`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(extractedData)
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            setHasUnsavedChanges(false)
            onSave?.(extractedData)

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to save changes'
            onError?.(errorMessage)
        } finally {
            setIsSaving(false)
        }
    }

    // Submit for approval
    const handleSubmit = async () => {
        if (!extractedData) return

        const errors = validateAllFields()
        if (Object.keys(errors).some(key => errors[key])) {
            onError?.('Please fix all validation errors before submitting')
            return
        }

        setIsSaving(true)
        try {
            const response = await fetch(`/api/documents/${documentId}/extracted-data/submit/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(extractedData)
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const updatedData = { ...extractedData, status: 'reviewed' as const }
            setExtractedData(updatedData)
            setHasUnsavedChanges(false)
            onSubmit?.(updatedData)

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to submit for approval'
            onError?.(errorMessage)
        } finally {
            setIsSaving(false)
        }
    }

    // Reset field to original value
    const resetField = (fieldId: string) => {
        if (!extractedData) return

        const updatedData = { ...extractedData }
        updatedData.fields[fieldId] = {
            ...updatedData.fields[fieldId],
            value: updatedData.fields[fieldId].original_value,
            is_modified: false
        }

        setExtractedData(updatedData)
        setHasUnsavedChanges(true)

        // Clear validation error for this field
        setValidationErrors(prev => ({
            ...prev,
            [fieldId]: ''
        }))
    }

    // Get field confidence styling
    const getConfidenceStyle = (confidence: number) => {
        if (confidence >= 0.9) return 'border-green-300 bg-green-50'
        if (confidence >= 0.7) return 'border-yellow-300 bg-yellow-50'
        return 'border-red-300 bg-red-50'
    }

    // Get field icon based on type
    const getFieldIcon = (fieldType: string) => {
        switch (fieldType) {
            case 'ssn':
            case 'ein':
                return <User className="w-4 h-4" />
            case 'currency':
                return <DollarSign className="w-4 h-4" />
            case 'date':
                return <Calendar className="w-4 h-4" />
            default:
                return <FileText className="w-4 h-4" />
        }
    }

    // Format field value for display
    const formatFieldValue = (field: ExtractedField): string => {
        if (field.field_type === 'currency' && typeof field.value === 'number') {
            return `$${field.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
        }
        return String(field.value)
    }

    // Highlight field in document (placeholder function)
    const highlightFieldInDocument = (fieldId: string) => {
        setHighlightedField(fieldId)
        // In a real implementation, this would scroll to and highlight the field in the document
    }

    // Load data on mount
    useEffect(() => {
        fetchExtractedData()
    }, [fetchExtractedData])

    // Validate on data load
    useEffect(() => {
        if (extractedData) {
            validateAllFields()
        }
    }, [extractedData, validateAllFields])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                    <p className="text-gray-600">Loading extracted data...</p>
                </div>
            </div>
        )
    }

    if (error || !extractedData) {
        return (
            <div className="p-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {error || 'No extracted data available'}
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={fetchExtractedData}
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

    const formConfig = FORM_CONFIGS[extractedData.document_type] || FORM_CONFIGS['W-2']
    const totalErrors = Object.keys(validationErrors).filter(key => validationErrors[key]).length
    const modifiedFields = Object.keys(extractedData.fields).filter(key => extractedData.fields[key].is_modified).length

    return (
        <TooltipProvider>
            <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Review Extracted Data</h1>
                        <div className="flex items-center space-x-4 mt-2">
                            <Badge variant="outline" className="text-blue-600 border-blue-600">
                                {extractedData.document_type}
                            </Badge>
                            <Badge 
                                variant="outline" 
                                className={extractedData.confidence_score >= 0.8 ? 
                                    'text-green-600 border-green-600' : 
                                    'text-yellow-600 border-yellow-600'
                                }
                            >
                                {(extractedData.confidence_score * 100).toFixed(1)}% Confidence
                            </Badge>
                            {totalErrors > 0 && (
                                <Badge variant="destructive">
                                    {totalErrors} Validation Error{totalErrors === 1 ? '' : 's'}
                                </Badge>
                            )}
                            {modifiedFields > 0 && (
                                <Badge variant="outline" className="text-orange-600 border-orange-600">
                                    {modifiedFields} Field{modifiedFields === 1 ? '' : 's'} Modified
                                </Badge>
                            )}
                        </div>
                    </div>
                    
                    {!readOnly && (
                        <div className="flex items-center space-x-3">
                            {hasUnsavedChanges && (
                                <span className="text-sm text-orange-600">Unsaved changes</span>
                            )}
                            <Button
                                variant="outline"
                                onClick={handleSave}
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4 mr-2" />
                                )}
                                Save Changes
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSaving || totalErrors > 0}
                            >
                                {isSaving ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                )}
                                Submit for Approval
                            </Button>
                        </div>
                    )}
                </div>

                {/* Progress Indicator */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Review Progress</span>
                            <span className="text-sm text-gray-600">
                                {Object.keys(extractedData.fields).length - totalErrors} / {Object.keys(extractedData.fields).length} fields valid
                            </span>
                        </div>
                        <Progress 
                            value={((Object.keys(extractedData.fields).length - totalErrors) / Object.keys(extractedData.fields).length) * 100} 
                            className="h-2"
                        />
                    </CardContent>
                </Card>

                {/* Main Content */}
                <div className={`grid gap-6 ${isDocumentExpanded ? 'grid-cols-1' : 'lg:grid-cols-2'}`}>
                    {/* Document Preview */}
                    <Card className={isDocumentExpanded ? 'order-2' : ''}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center space-x-2">
                                    <Eye className="w-5 h-5" />
                                    <span>Original Document</span>
                                </CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsDocumentExpanded(!isDocumentExpanded)}
                                >
                                    {isDocumentExpanded ? (
                                        <Minimize2 className="w-4 h-4" />
                                    ) : (
                                        <Maximize2 className="w-4 h-4" />
                                    )}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className={`bg-gray-100 rounded-lg overflow-hidden ${isDocumentExpanded ? 'h-96' : 'h-80'}`}>
                                <iframe
                                    ref={documentRef}
                                    src={extractedData.file_url}
                                    className="w-full h-full border-0"
                                    title="Document Preview"
                                />
                            </div>
                            
                            {highlightedField && (
                                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-center space-x-2">
                                        <Info className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm text-blue-800">
                                            Highlighting field: {extractedData.fields[highlightedField]?.label}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setHighlightedField(null)}
                                        >
                                            <X className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Extracted Data Form */}
                    <Card className={isDocumentExpanded ? 'order-1' : ''}>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Edit3 className="w-5 h-5" />
                                <span>Extracted Data</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className={isDocumentExpanded ? 'h-96' : 'h-80'}>
                                <div className="space-y-6">
                                    {Object.entries(formConfig).map(([sectionKey, section]) => (
                                        <div key={sectionKey} className="space-y-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">{section.label}</h3>
                                                <Separator className="mt-2" />
                                            </div>
                                            
                                            <div className="grid gap-4">
                                                {section.fields.map(fieldId => {
                                                    const field = extractedData.fields[fieldId]
                                                    if (!field) return null

                                                    const hasError = validationErrors[fieldId]
                                                    const isEditing = editingField === fieldId

                                                    return (
                                                        <div key={fieldId} className="space-y-2">
                                                            <div className={`
                                                                p-4 border rounded-lg transition-colors
                                                                ${hasError ? 'border-red-300 bg-red-50' : 
                                                                  field.is_modified ? 'border-orange-300 bg-orange-50' :
                                                                  getConfidenceStyle(field.confidence)}
                                                            `}>
                                                                <div className="flex items-start justify-between mb-3">
                                                                    <div className="flex items-center space-x-2">
                                                                        {getFieldIcon(field.field_type)}
                                                                        <Label className="font-medium text-gray-900">
                                                                            {field.label}
                                                                        </Label>
                                                                        {field.validation_rules?.required && (
                                                                            <span className="text-red-500">*</span>
                                                                        )}
                                                                    </div>
                                                                    
                                                                    <div className="flex items-center space-x-2">
                                                                        <Tooltip>
                                                                            <TooltipTrigger>
                                                                                <Badge 
                                                                                    variant="outline" 
                                                                                    className="text-xs cursor-help"
                                                                                >
                                                                                    {(field.confidence * 100).toFixed(0)}%
                                                                                </Badge>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>
                                                                                <p>Extraction confidence score</p>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                        
                                                                        {field.is_modified && (
                                                                            <Tooltip>
                                                                                <TooltipTrigger>
                                                                                    <Button
                                                                                        variant="ghost"
                                                                                        size="sm"
                                                                                        onClick={() => resetField(fieldId)}
                                                                                        className="h-6 w-6 p-0"
                                                                                    >
                                                                                        <RotateCcw className="w-3 h-3" />
                                                                                    </Button>
                                                                                </TooltipTrigger>
                                                                                <TooltipContent>
                                                                                    <p>Reset to original value</p>
                                                                                </TooltipContent>
                                                                            </Tooltip>
                                                                        )}
                                                                        
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => highlightFieldInDocument(fieldId)}
                                                                            className="h-6 w-6 p-0"
                                                                        >
                                                                            <Eye className="w-3 h-3" />
                                                                        </Button>
                                                                    </div>
                                                                </div>

                                                                {isEditing ? (
                                                                    <div className="space-y-3">
                                                                        {field.field_type === 'text' && field.validation_rules?.max_length && field.validation_rules.max_length > 100 ? (
                                                                            <Textarea
                                                                                value={String(field.value)}
                                                                                onChange={(e) => handleFieldChange(fieldId, e.target.value)}
                                                                                className="w-full"
                                                                                rows={3}
                                                                                disabled={readOnly}
                                                                            />
                                                                        ) : (
                                                                            <Input
                                                                                value={String(field.value)}
                                                                                onChange={(e) => handleFieldChange(fieldId, e.target.value)}
                                                                                className="w-full"
                                                                                type={field.field_type === 'number' || field.field_type === 'currency' ? 'text' : 'text'}
                                                                                disabled={readOnly}
                                                                            />
                                                                        )}
                                                                        
                                                                        <div className="flex space-x-2">
                                                                            <Button
                                                                                size="sm"
                                                                                onClick={() => setEditingField(null)}
                                                                                disabled={readOnly}
                                                                            >
                                                                                <Check className="w-3 h-3 mr-1" />
                                                                                Done
                                                                            </Button>
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                onClick={() => {
                                                                                    // Reset to last saved value
                                                                                    setEditingField(null)
                                                                                }}
                                                                            >
                                                                                <X className="w-3 h-3 mr-1" />
                                                                                Cancel
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div 
                                                                        className="cursor-pointer group"
                                                                        onClick={() => !readOnly && setEditingField(fieldId)}
                                                                    >
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="flex-1">
                                                                                <p className="text-lg font-medium text-gray-900">
                                                                                    {formatFieldValue(field)}
                                                                                </p>
                                                                                {field.is_modified && (
                                                                                    <p className="text-sm text-gray-500 mt-1">
                                                                                        Original: {formatFieldValue({...field, value: field.original_value})}
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                            {!readOnly && (
                                                                                <Edit3 className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {hasError && (
                                                                    <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-sm text-red-700">
                                                                        <div className="flex items-center space-x-2">
                                                                            <AlertTriangle className="w-4 h-4" />
                                                                            <span>{hasError}</span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>

                {/* Summary Card */}
                {(modifiedFields > 0 || totalErrors > 0) && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <AlertCircle className="w-5 h-5" />
                                <span>Review Summary</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {modifiedFields > 0 && (
                                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                        <h4 className="font-medium text-orange-800 mb-2">Modified Fields ({modifiedFields})</h4>
                                        <div className="space-y-1">
                                            {Object.entries(extractedData.fields)
                                                .filter(([_, field]) => field.is_modified)
                                                .map(([fieldId, field]) => (
                                                    <div key={fieldId} className="text-sm text-orange-700">
                                                        • {field.label}
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                )}

                                {totalErrors > 0 && (
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <h4 className="font-medium text-red-800 mb-2">Validation Errors ({totalErrors})</h4>
                                        <div className="space-y-1">
                                            {Object.entries(validationErrors)
                                                .filter(([_, error]) => error)
                                                .map(([fieldId, error]) => (
                                                    <div key={fieldId} className="text-sm text-red-700">
                                                        • {extractedData.fields[fieldId]?.label}: {error}
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </TooltipProvider>
    )
}
