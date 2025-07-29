import { NextRequest, NextResponse } from 'next/server'

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

// Generate mock extracted data based on document type
const generateMockExtractedData = (documentId: string): ExtractedData => {
    // Determine document type based on document ID pattern
    let documentType: ExtractedData['document_type'] = 'W-2'
    if (documentId.includes('1099nec')) documentType = '1099-NEC'
    else if (documentId.includes('1099misc')) documentType = '1099-MISC'
    else if (documentId.includes('w4')) documentType = 'W-4'
    else if (documentId.includes('1040')) documentType = '1040'

    const baseData: ExtractedData = {
        document_id: documentId,
        document_type: documentType,
        extraction_date: new Date().toISOString(),
        confidence_score: 0.87,
        status: 'pending_review',
        fields: {},
        validation_errors: [],
        file_url: `https://example.com/documents/${documentId}/document.pdf`,
        thumbnail_url: `https://example.com/thumbnails/${documentId}.jpg`,
        metadata: {
            pages: 1,
            processing_time: 2.34,
            ocr_engine: 'Tesseract v5.0',
            model_version: 'tax-extractor-v2.1'
        }
    }

    // Generate form-specific fields
    switch (documentType) {
        case 'W-2':
            baseData.fields = {
                employee_name: {
                    id: 'employee_name',
                    label: 'Employee Name',
                    value: 'John Smith',
                    original_value: 'John Smith',
                    confidence: 0.95,
                    field_type: 'text',
                    validation_rules: { required: true, min_length: 2, max_length: 50 },
                    coordinates: { x: 100, y: 150, width: 200, height: 20, page: 1 }
                },
                employee_ssn: {
                    id: 'employee_ssn',
                    label: 'Employee SSN',
                    value: '123-45-6789',
                    original_value: '123-45-6789',
                    confidence: 0.92,
                    field_type: 'ssn',
                    validation_rules: { required: true, pattern: '^\\d{3}-\\d{2}-\\d{4}$' },
                    coordinates: { x: 100, y: 180, width: 120, height: 20, page: 1 }
                },
                employer_name: {
                    id: 'employer_name',
                    label: 'Employer Name',
                    value: 'Acme Corporation',
                    original_value: 'Acme Corporation',
                    confidence: 0.89,
                    field_type: 'text',
                    validation_rules: { required: true, min_length: 2, max_length: 100 },
                    coordinates: { x: 100, y: 210, width: 250, height: 20, page: 1 }
                },
                employer_ein: {
                    id: 'employer_ein',
                    label: 'Employer EIN',
                    value: '12-3456789',
                    original_value: '12-3456789',
                    confidence: 0.78,
                    field_type: 'ein',
                    validation_rules: { required: true, pattern: '^\\d{2}-\\d{7}$' },
                    coordinates: { x: 100, y: 240, width: 120, height: 20, page: 1 }
                },
                wages_tips: {
                    id: 'wages_tips',
                    label: 'Wages, Tips, Other Compensation',
                    value: 75000.00,
                    original_value: 75000.00,
                    confidence: 0.94,
                    field_type: 'currency',
                    validation_rules: { required: true, min_value: 0, max_value: 10000000 },
                    coordinates: { x: 400, y: 150, width: 100, height: 20, page: 1 }
                },
                federal_tax_withheld: {
                    id: 'federal_tax_withheld',
                    label: 'Federal Income Tax Withheld',
                    value: 12500.00,
                    original_value: 12500.00,
                    confidence: 0.91,
                    field_type: 'currency',
                    validation_rules: { min_value: 0 },
                    coordinates: { x: 400, y: 180, width: 100, height: 20, page: 1 }
                },
                social_security_wages: {
                    id: 'social_security_wages',
                    label: 'Social Security Wages',
                    value: 75000.00,
                    original_value: 75000.00,
                    confidence: 0.88,
                    field_type: 'currency',
                    validation_rules: { min_value: 0 },
                    coordinates: { x: 400, y: 210, width: 100, height: 20, page: 1 }
                },
                social_security_tax: {
                    id: 'social_security_tax',
                    label: 'Social Security Tax Withheld',
                    value: 4650.00,
                    original_value: 4650.00,
                    confidence: 0.85,
                    field_type: 'currency',
                    validation_rules: { min_value: 0 },
                    coordinates: { x: 400, y: 240, width: 100, height: 20, page: 1 }
                },
                medicare_wages: {
                    id: 'medicare_wages',
                    label: 'Medicare Wages and Tips',
                    value: 75000.00,
                    original_value: 75000.00,
                    confidence: 0.87,
                    field_type: 'currency',
                    validation_rules: { min_value: 0 },
                    coordinates: { x: 400, y: 270, width: 100, height: 20, page: 1 }
                },
                medicare_tax: {
                    id: 'medicare_tax',
                    label: 'Medicare Tax Withheld',
                    value: 1087.50,
                    original_value: 1087.50,
                    confidence: 0.83,
                    field_type: 'currency',
                    validation_rules: { min_value: 0 },
                    coordinates: { x: 400, y: 300, width: 100, height: 20, page: 1 }
                }
            }
            break

        case '1099-NEC':
            baseData.fields = {
                payer_name: {
                    id: 'payer_name',
                    label: 'Payer Name',
                    value: 'Tech Solutions LLC',
                    original_value: 'Tech Solutions LLC',
                    confidence: 0.93,
                    field_type: 'text',
                    validation_rules: { required: true, min_length: 2, max_length: 100 }
                },
                payer_tin: {
                    id: 'payer_tin',
                    label: 'Payer TIN',
                    value: '98-7654321',
                    original_value: '98-7654321',
                    confidence: 0.89,
                    field_type: 'ein',
                    validation_rules: { required: true, pattern: '^\\d{2}-\\d{7}$' }
                },
                recipient_name: {
                    id: 'recipient_name',
                    label: 'Recipient Name',
                    value: 'Jane Doe',
                    original_value: 'Jane Doe',
                    confidence: 0.96,
                    field_type: 'text',
                    validation_rules: { required: true, min_length: 2, max_length: 50 }
                },
                recipient_ssn: {
                    id: 'recipient_ssn',
                    label: 'Recipient SSN/TIN',
                    value: '987-65-4321',
                    original_value: '987-65-4321',
                    confidence: 0.94,
                    field_type: 'ssn',
                    validation_rules: { required: true, pattern: '^\\d{3}-\\d{2}-\\d{4}$' }
                },
                nonemployee_compensation: {
                    id: 'nonemployee_compensation',
                    label: 'Nonemployee Compensation',
                    value: 25000.00,
                    original_value: 25000.00,
                    confidence: 0.91,
                    field_type: 'currency',
                    validation_rules: { required: true, min_value: 0 }
                },
                federal_tax_withheld: {
                    id: 'federal_tax_withheld',
                    label: 'Federal Income Tax Withheld',
                    value: 0.00,
                    original_value: 0.00,
                    confidence: 0.85,
                    field_type: 'currency',
                    validation_rules: { min_value: 0 }
                }
            }
            break

        default:
            // Generic fields for other document types
            baseData.fields = {
                form_field_1: {
                    id: 'form_field_1',
                    label: 'Field 1',
                    value: 'Sample Value 1',
                    original_value: 'Sample Value 1',
                    confidence: 0.85,
                    field_type: 'text',
                    validation_rules: { required: true }
                },
                form_field_2: {
                    id: 'form_field_2',
                    label: 'Field 2',
                    value: 1000.00,
                    original_value: 1000.00,
                    confidence: 0.78,
                    field_type: 'currency',
                    validation_rules: { min_value: 0 }
                }
            }
    }

    return baseData
}

// GET handler - retrieve extracted data
export async function GET(
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

        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 800))

        // Check if document exists (mock validation)
        if (documentId.includes('invalid')) {
            return NextResponse.json(
                { error: 'Document not found or extraction not completed' },
                { status: 404 }
            )
        }

        // Generate mock extracted data
        const extractedData = generateMockExtractedData(documentId)
        
        console.log(`Retrieved extracted data for document: ${documentId}`)
        
        return NextResponse.json(extractedData, { status: 200 })

    } catch (error) {
        console.error('Error retrieving extracted data:', error)
        
        return NextResponse.json(
            { 
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}

// PUT handler - update extracted data with corrections
export async function PUT(
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

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 500))

        // In a real application, you would:
        // 1. Validate the user has permission to edit this document
        // 2. Validate the updated field data
        // 3. Save the corrections to your database
        // 4. Update extraction status and timestamps
        // 5. Log the changes for audit purposes
        // 6. Trigger any downstream processing if needed

        console.log(`Saving extracted data corrections for document ${documentId}`)
        console.log(`Modified fields:`, Object.keys(extractedData.fields).filter(key => extractedData.fields[key].is_modified))

        // Update the last modified timestamp
        const updatedData: ExtractedData = {
            ...extractedData,
            extraction_date: new Date().toISOString(),
            status: 'reviewed'
        }

        return NextResponse.json(updatedData, { status: 200 })

    } catch (error) {
        console.error('Error updating extracted data:', error)
        
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
export async function POST() {
    return NextResponse.json(
        { error: 'Method not allowed. Use PUT to update extracted data.' },
        { status: 405 }
    )
}

export async function DELETE() {
    return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
    )
}
