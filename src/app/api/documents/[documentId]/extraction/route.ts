import { NextRequest, NextResponse } from 'next/server'

// Interface for the extraction API response
interface ExtractionResult {
    document_id: string
    file_url: string
    form_type: string
    confidence: number
    extracted_data: ExtractedData
    validation_errors: ValidationError[]
}

interface ExtractedData {
    [key: string]: {
        value: string | number
        confidence: number
        field_type: 'text' | 'number' | 'date' | 'currency'
        label: string
    }
}

interface ValidationError {
    field: string
    message: string
    severity: 'error' | 'warning'
}

interface UpdateRequest {
    extracted_data: ExtractedData
}

// Mock data for demonstration (in a real app, this would come from your database/ML service)
const getMockExtractionData = (documentId: string): ExtractionResult => {
    // Simulate different form types based on document ID
    const formTypes = ['W-2', '1099-MISC', 'W-4', '1040', 'Schedule C']
    const formType = formTypes[parseInt(documentId.slice(-1)) % formTypes.length] || 'W-2'
    
    const baseData: ExtractionResult = {
        document_id: documentId,
        file_url: `https://example.com/documents/${documentId}.pdf`,
        form_type: formType,
        confidence: 0.87,
        extracted_data: {},
        validation_errors: []
    }

    // Generate form-specific mock data
    switch (formType) {
        case 'W-2':
            baseData.extracted_data = {
                employee_name: {
                    value: 'John Smith',
                    confidence: 0.95,
                    field_type: 'text',
                    label: 'Employee Name'
                },
                employee_ssn: {
                    value: '123-45-6789',
                    confidence: 0.88,
                    field_type: 'text',
                    label: 'Employee SSN'
                },
                wages_tips: {
                    value: 75000.00,
                    confidence: 0.92,
                    field_type: 'currency',
                    label: 'Wages, Tips, Other Compensation'
                },
                federal_tax_withheld: {
                    value: 12500.00,
                    confidence: 0.89,
                    field_type: 'currency',
                    label: 'Federal Income Tax Withheld'
                },
                employer_name: {
                    value: 'Acme Corporation',
                    confidence: 0.93,
                    field_type: 'text',
                    label: 'Employer Name'
                },
                employer_ein: {
                    value: '12-3456789',
                    confidence: 0.45,
                    field_type: 'text',
                    label: 'Employer EIN'
                }
            }
            baseData.validation_errors = [
                {
                    field: 'employer_ein',
                    message: 'EIN format appears incorrect. Should be XX-XXXXXXX format.',
                    severity: 'warning'
                }
            ]
            break

        case '1099-MISC':
            baseData.extracted_data = {
                payer_name: {
                    value: 'XYZ Company LLC',
                    confidence: 0.91,
                    field_type: 'text',
                    label: 'Payer Name'
                },
                payer_tin: {
                    value: '98-7654321',
                    confidence: 0.87,
                    field_type: 'text',
                    label: 'Payer TIN'
                },
                recipient_name: {
                    value: 'Jane Doe',
                    confidence: 0.94,
                    field_type: 'text',
                    label: 'Recipient Name'
                },
                recipient_ssn: {
                    value: '987-65-4321',
                    confidence: 0.86,
                    field_type: 'text',
                    label: 'Recipient SSN/TIN'
                },
                nonemployee_compensation: {
                    value: 25000.00,
                    confidence: 0.89,
                    field_type: 'currency',
                    label: 'Nonemployee Compensation'
                },
                tax_year: {
                    value: '2023',
                    confidence: 0.98,
                    field_type: 'text',
                    label: 'Tax Year'
                }
            }
            break

        default:
            baseData.extracted_data = {
                form_field_1: {
                    value: 'Sample Value 1',
                    confidence: 0.85,
                    field_type: 'text',
                    label: 'Field 1'
                },
                form_field_2: {
                    value: 1000.00,
                    confidence: 0.75,
                    field_type: 'currency',
                    label: 'Field 2'
                }
            }
    }

    return baseData
}

// Validate extracted data
const validateExtractionData = (data: ExtractedData): ValidationError[] => {
    const errors: ValidationError[] = []
    
    // Example validation rules
    Object.entries(data).forEach(([fieldName, field]) => {
        // Check confidence threshold
        if (field.confidence < 0.7) {
            errors.push({
                field: fieldName,
                message: `Low confidence score (${(field.confidence * 100).toFixed(1)}%). Please verify this value.`,
                severity: 'warning'
            })
        }

        // Field-specific validations
        if (fieldName.includes('ssn') && typeof field.value === 'string') {
            const ssnPattern = /^\d{3}-\d{2}-\d{4}$/
            if (!ssnPattern.test(field.value)) {
                errors.push({
                    field: fieldName,
                    message: 'SSN format should be XXX-XX-XXXX',
                    severity: 'error'
                })
            }
        }

        if (fieldName.includes('ein') && typeof field.value === 'string') {
            const einPattern = /^\d{2}-\d{7}$/
            if (!einPattern.test(field.value)) {
                errors.push({
                    field: fieldName,
                    message: 'EIN format should be XX-XXXXXXX',
                    severity: 'warning'
                })
            }
        }

        if (field.field_type === 'currency' && typeof field.value === 'string') {
            const numValue = parseFloat(field.value.replace(/[,$]/g, ''))
            if (isNaN(numValue) || numValue < 0) {
                errors.push({
                    field: fieldName,
                    message: 'Invalid currency value',
                    severity: 'error'
                })
            }
        }
    })

    return errors
}

// GET handler - retrieve extraction results
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

        // In a real application, you would:
        // 1. Validate the user has access to this document
        // 2. Check if extraction is completed
        // 3. Retrieve data from your database/ML service
        // 4. Return the actual extraction results

        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 500))

        // Check if document exists (mock validation)
        if (documentId.includes('invalid')) {
            return NextResponse.json(
                { error: 'Document not found or extraction not completed' },
                { status: 404 }
            )
        }

        const extractionData = getMockExtractionData(documentId)
        
        return NextResponse.json(extractionData, { status: 200 })

    } catch (error) {
        console.error('Error retrieving extraction data:', error)
        
        return NextResponse.json(
            { 
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}

// PUT handler - update extraction results with corrections
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
        const body: UpdateRequest = await request.json()
        
        if (!body.extracted_data) {
            return NextResponse.json(
                { error: 'extracted_data is required' },
                { status: 400 }
            )
        }

        // In a real application, you would:
        // 1. Validate the user has permission to edit this document
        // 2. Validate the updated data format
        // 3. Save the corrections to your database
        // 4. Update any downstream systems
        // 5. Log the changes for audit purposes

        // Validate the updated data
        const validationErrors = validateExtractionData(body.extracted_data)

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 300))

        console.log(`Saving corrections for document ${documentId}:`, body.extracted_data)
        console.log(`Validation errors found:`, validationErrors)

        // Return updated extraction result
        const updatedResult: ExtractionResult = {
            document_id: documentId,
            file_url: `https://example.com/documents/${documentId}.pdf`,
            form_type: 'Updated Form',
            confidence: 0.95, // Confidence might increase after manual correction
            extracted_data: body.extracted_data,
            validation_errors: validationErrors
        }

        return NextResponse.json(updatedResult, { status: 200 })

    } catch (error) {
        console.error('Error updating extraction data:', error)
        
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
