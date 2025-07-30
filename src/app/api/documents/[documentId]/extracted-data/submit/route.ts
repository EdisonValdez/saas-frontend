import { NextRequest, NextResponse } from 'next/server'

// TypeScript interfaces (same as main extraction route)
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

interface SubmitResponse {
    document_id: string
    status: 'reviewed'
    message: string
    submitted_at: string
    reviewer_notes?: string
}

// Validation patterns for tax-specific fields
const VALIDATION_PATTERNS = {
    ssn: /^\d{3}-\d{2}-\d{4}$/,
    ein: /^\d{2}-\d{7}$/,
    currency: /^\$?[\d,]+\.?\d{0,2}$/,
    percentage: /^\d{1,3}(\.\d{1,2})?%?$/,
    date: /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/
}

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

// Validate all fields in extracted data
const validateExtractedData = (data: ExtractedData): string[] => {
    const errors: string[] = []
    
    Object.entries(data.fields).forEach(([fieldId, field]) => {
        const error = validateField(field)
        if (error) {
            errors.push(`${field.label}: ${error}`)
        }
    })

    return errors
}

// POST handler - submit extracted data for approval
export async function POST(
    request: NextRequest,
    { params }: { params: { documentId: string } }
) {
    try {
        const { documentId } = params

        if (!documentId) {
            return NextResponse.json(
                { error: 'Document ID is required' },
                { status: 400 }
            )
        }

        // Parse request body
        const extractedData: ExtractedData = await request.json()
        
        if (!extractedData.fields) {
            return NextResponse.json(
                { error: 'fields data is required' },
                { status: 400 }
            )
        }

        // Validate all fields before submission
        const validationErrors = validateExtractedData(extractedData)
        
        if (validationErrors.length > 0) {
            return NextResponse.json(
                { 
                    error: 'Validation failed',
                    validation_errors: validationErrors,
                    message: 'Please fix all validation errors before submitting for approval'
                },
                { status: 422 }
            )
        }

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 800))

        // In a real application, you would:
        // 1. Validate the user has permission to submit this document
        // 2. Perform final validation checks
        // 3. Update the document status to 'reviewed'
        // 4. Create an approval workflow entry
        // 5. Notify supervisors/approvers
        // 6. Log the submission for audit purposes
        // 7. Lock the document from further edits (depending on business rules)

        const submittedAt = new Date().toISOString()
        
        console.log(`Submitted extracted data for approval: document ${documentId}`)
        console.log(`Submission time: ${submittedAt}`)
        console.log(`Modified fields count: ${Object.keys(extractedData.fields).filter(key => extractedData.fields[key].is_modified).length}`)

        // Calculate submission statistics for logging
        const modifiedFields = Object.keys(extractedData.fields).filter(key => extractedData.fields[key].is_modified)
        const avgConfidence = Object.values(extractedData.fields).reduce((sum, field) => sum + field.confidence, 0) / Object.keys(extractedData.fields).length

        const response: SubmitResponse = {
            document_id: documentId,
            status: 'reviewed',
            message: 'Document submitted for approval successfully',
            submitted_at: submittedAt,
            reviewer_notes: modifiedFields.length > 0 ? 
                `${modifiedFields.length} field(s) were manually corrected. Average confidence: ${(avgConfidence * 100).toFixed(1)}%` :
                `No manual corrections needed. Average confidence: ${(avgConfidence * 100).toFixed(1)}%`
        }

        return NextResponse.json(response, { status: 200 })

    } catch (error) {
        console.error('Error submitting extracted data for approval:', error)
        
        if (error instanceof SyntaxError) {
            return NextResponse.json(
                { error: 'Invalid JSON in request body' },
                { status: 400 }
            )
        }
        
        return NextResponse.json(
            { 
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}

// Handle unsupported methods
export async function GET() {
    return NextResponse.json(
        { error: 'Method not allowed. Use POST to submit for approval.' },
        { status: 405 }
    )
}

export async function PUT() {
    return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
    )
}

export async function DELETE() {
    return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
    )
}
