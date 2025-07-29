import { NextRequest, NextResponse } from 'next/server'

// Interface for the API response
interface DocumentUploadResponse {
    document_id: string
    status: 'pending'
}

// Interface for error responses
interface ErrorResponse {
    error: string
    details?: string
}

// Allowed file types
const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/tiff'
]

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024

// Generate a unique document ID (in a real app, this would come from your database)
const generateDocumentId = (): string => {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Validate file type and size
const validateFile = (file: File): string | null => {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return 'Invalid file type. Only PDF, JPG, PNG, and TIFF files are allowed.'
    }

    if (file.size > MAX_FILE_SIZE) {
        return 'File size exceeds the 10MB limit.'
    }

    return null
}

// Simulate file processing (in a real app, you'd save to storage and database)
const processDocument = async (file: File, clientId: string): Promise<DocumentUploadResponse> => {
    // In a real application, you would:
    // 1. Save the file to cloud storage (S3, Google Cloud Storage, etc.)
    // 2. Save document metadata to your database
    // 3. Trigger document processing pipeline
    // 4. Return the actual document ID from your database

    // For now, we'll simulate this process
    console.log(`Processing document: ${file.name} for client: ${clientId}`)
    console.log(`File size: ${file.size} bytes, type: ${file.type}`)

    // Simulate async processing delay
    await new Promise(resolve => setTimeout(resolve, 100))

    const documentId = generateDocumentId()

    return {
        document_id: documentId,
        status: 'pending'
    }
}

export async function POST(request: NextRequest) {
    try {
        // Parse the form data
        const formData = await request.formData()
        
        // Extract file and client_id
        const file = formData.get('file') as File
        const clientId = formData.get('client_id') as string

        // Validate required fields
        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' } as ErrorResponse,
                { status: 400 }
            )
        }

        if (!clientId) {
            return NextResponse.json(
                { error: 'client_id is required' } as ErrorResponse,
                { status: 400 }
            )
        }

        // Validate file
        const fileValidationError = validateFile(file)
        if (fileValidationError) {
            return NextResponse.json(
                { error: fileValidationError } as ErrorResponse,
                { status: 400 }
            )
        }

        // Process the document
        const result = await processDocument(file, clientId)

        // Return success response
        return NextResponse.json(result, { status: 201 })

    } catch (error) {
        console.error('Error processing document upload:', error)
        
        // Return error response
        return NextResponse.json(
            { 
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error'
            } as ErrorResponse,
            { status: 500 }
        )
    }
}

// Handle unsupported methods
export async function GET() {
    return NextResponse.json(
        { error: 'Method not allowed' } as ErrorResponse,
        { status: 405 }
    )
}

export async function PUT() {
    return NextResponse.json(
        { error: 'Method not allowed' } as ErrorResponse,
        { status: 405 }
    )
}

export async function DELETE() {
    return NextResponse.json(
        { error: 'Method not allowed' } as ErrorResponse,
        { status: 405 }
    )
}
