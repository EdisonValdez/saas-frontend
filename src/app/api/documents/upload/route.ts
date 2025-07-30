import { NextRequest, NextResponse } from 'next/server'

// Document interface
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

interface UploadResponse {
    document_id: string
    status: 'pending'
    message: string
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

// Generate document ID
const generateDocumentId = (): string => {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Simulate document type classification
const classifyDocument = (filename: string): Document['document_type'] => {
    const name = filename.toLowerCase()
    
    if (name.includes('w-2') || name.includes('w2')) return 'W-2'
    if (name.includes('1099-nec') || name.includes('1099nec')) return '1099-NEC'
    if (name.includes('1099-misc') || name.includes('1099misc')) return '1099-MISC'
    if (name.includes('w-4') || name.includes('w4')) return 'W-4'
    if (name.includes('1040')) return '1040'
    if (name.includes('schedule') && name.includes('c')) return 'Schedule C'
    
    return 'Other'
}

// Validate file
const validateFile = (file: File): string | null => {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return 'Invalid file type. Only PDF, JPEG, PNG, and TIFF files are allowed.'
    }

    if (file.size > MAX_FILE_SIZE) {
        return 'File size exceeds the 10MB limit.'
    }

    return null
}

// Simulate file storage and processing
const processDocument = async (file: File, workspace: string, clientId?: string): Promise<Document> => {
    // In a real application, you would:
    // 1. Save the file to cloud storage (S3, Google Cloud Storage, etc.)
    // 2. Save document metadata to your database
    // 3. Trigger document processing pipeline (OCR, classification, etc.)
    // 4. Return the actual document record from your database

    console.log(`Processing document: ${file.name}`)
    console.log(`Workspace: ${workspace}, Client: ${clientId || 'none'}`)
    console.log(`File size: ${file.size} bytes, type: ${file.type}`)

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 200))

    const documentId = generateDocumentId()
    const documentType = classifyDocument(file.name)
    
    // Simulate client lookup
    const clientNames = ['John Smith', 'Sarah Johnson', 'Acme Corporation', 'TechStart LLC']
    const clientName = clientId ? clientNames[Math.floor(Math.random() * clientNames.length)] : undefined

    const document: Document = {
        id: documentId,
        filename: file.name,
        file_type: file.type,
        file_size: file.size,
        upload_date: new Date().toISOString(),
        status: 'pending',
        document_type: documentType,
        client_id: clientId,
        client_name: clientName,
        file_url: `https://example.com/documents/${documentId}/${file.name}`,
        thumbnail_url: file.type.startsWith('image/') ? 
            `https://example.com/thumbnails/${documentId}.jpg` : undefined,
        extraction_confidence: Math.random() * 0.3 + 0.7, // 70-100%
        metadata: {
            pages: file.type === 'application/pdf' ? Math.floor(Math.random() * 5) + 1 : 1,
            created_by: 'api_user',
            last_modified: new Date().toISOString()
        }
    }

    return document
}

// POST handler - upload document
export async function POST(request: NextRequest) {
    try {
        // Parse form data
        const formData = await request.formData()
        
        // Extract fields
        const file = formData.get('file') as File
        const workspace = formData.get('workspace') as string
        const clientId = formData.get('client_id') as string | null

        // Validate required fields
        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            )
        }

        if (!workspace) {
            return NextResponse.json(
                { error: 'workspace is required' },
                { status: 400 }
            )
        }

        // Validate file
        const fileValidationError = validateFile(file)
        if (fileValidationError) {
            return NextResponse.json(
                { error: fileValidationError },
                { status: 400 }
            )
        }

        // Process the document
        const document = await processDocument(file, workspace, clientId || undefined)

        // Simulate starting background processing
        setTimeout(async () => {
            // In a real app, this would be handled by a background job queue
            console.log(`Background processing started for document ${document.id}`)
        }, 1000)

        const response: UploadResponse = {
            document_id: document.id,
            status: 'pending',
            message: 'Document uploaded successfully and processing has started'
        }

        return NextResponse.json(response, { status: 201 })

    } catch (error) {
        console.error('Error processing document upload:', error)
        
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
        { error: 'Method not allowed. Use POST to upload documents.' },
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
