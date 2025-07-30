import { NextRequest, NextResponse } from 'next/server'

// Document interface (same as upload route)
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

interface DocumentListResponse {
    documents: Document[]
    total: number
    page: number
    page_size: number
    total_pages: number
}

// Generate mock documents
const generateMockDocuments = (workspace: string, clientId?: string): Document[] => {
    const documentTypes: Document['document_type'][] = ['W-2', '1099-NEC', '1099-MISC', 'W-4', '1040', 'Schedule C', 'Other']
    const statuses: Document['status'][] = ['pending', 'processing', 'completed', 'failed', 'archived']
    const fileTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff']
    const clientNames = ['John Smith', 'Sarah Johnson', 'Acme Corporation', 'TechStart LLC', 'Innovation Partners', 'Global Enterprises']
    
    const baseFilenames = [
        'W2_2023_JohnSmith.pdf',
        '1099NEC_2023_Contractor.pdf',
        'W4_NewEmployee.pdf',
        '1040_Tax_Return_2023.pdf',
        'ScheduleC_Business_2023.pdf',
        '1099MISC_Rental_Income.pdf',
        'Tax_Document_001.pdf',
        'Employee_W2_Form.pdf',
        'Contractor_1099.pdf',
        'Business_Tax_Form.pdf',
        'Personal_Tax_Return.pdf',
        'Income_Statement.pdf',
        'Scanned_Tax_Doc.jpg',
        'Photo_W2_Form.png',
        'Document_Upload.pdf'
    ]

    const documents: Document[] = []
    const count = workspace.includes('small') ? 8 : workspace.includes('corporate') ? 25 : 15

    for (let i = 0; i < count; i++) {
        const filename = baseFilenames[i % baseFilenames.length]
        const fileType = fileTypes[Math.floor(Math.random() * fileTypes.length)]
        const documentType = documentTypes[Math.floor(Math.random() * documentTypes.length)]
        const status = statuses[Math.floor(Math.random() * statuses.length)]
        
        // Generate upload date within last 30 days
        const uploadDate = new Date()
        uploadDate.setDate(uploadDate.getDate() - Math.floor(Math.random() * 30))
        
        const docClientId = clientId || `client_${Math.floor(Math.random() * 10) + 1}`
        const clientName = clientNames[Math.floor(Math.random() * clientNames.length)]

        const document: Document = {
            id: `doc_${i + 1}_${Date.now()}`,
            filename: `${i + 1}_${filename}`,
            file_type: fileType,
            file_size: Math.floor(Math.random() * 5000000) + 100000, // 100KB - 5MB
            upload_date: uploadDate.toISOString(),
            status,
            document_type: documentType,
            client_id: docClientId,
            client_name: clientName,
            file_url: `https://example.com/documents/doc_${i + 1}/${filename}`,
            thumbnail_url: fileType.startsWith('image/') ? 
                `https://example.com/thumbnails/doc_${i + 1}.jpg` : undefined,
            extraction_confidence: status === 'completed' ? 
                Math.random() * 0.3 + 0.7 : undefined, // 70-100% for completed
            error_message: status === 'failed' ? 
                'OCR processing failed due to poor image quality' : undefined,
            tags: Math.random() > 0.5 ? ['tax-2023', 'processed'] : undefined,
            metadata: {
                pages: fileType === 'application/pdf' ? Math.floor(Math.random() * 5) + 1 : 1,
                created_by: 'user_demo',
                last_modified: new Date().toISOString()
            }
        }

        documents.push(document)
    }

    return documents.sort((a, b) => new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime())
}

// GET handler - list documents
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        
        const workspace = searchParams.get('workspace')
        const clientId = searchParams.get('client_id')
        const status = searchParams.get('status')
        const documentType = searchParams.get('document_type')
        const page = parseInt(searchParams.get('page') || '1')
        const pageSize = parseInt(searchParams.get('page_size') || '50')
        const search = searchParams.get('search')

        if (!workspace) {
            return NextResponse.json(
                { error: 'workspace parameter is required' },
                { status: 400 }
            )
        }

        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 500))

        // Generate mock documents
        let documents = generateMockDocuments(workspace, clientId || undefined)

        // Apply filters
        if (status && status !== 'all') {
            documents = documents.filter(doc => doc.status === status)
        }

        if (documentType && documentType !== 'all') {
            documents = documents.filter(doc => doc.document_type === documentType)
        }

        if (search) {
            const searchLower = search.toLowerCase()
            documents = documents.filter(doc => 
                doc.filename.toLowerCase().includes(searchLower) ||
                doc.client_name?.toLowerCase().includes(searchLower) ||
                doc.document_type?.toLowerCase().includes(searchLower)
            )
        }

        if (clientId) {
            documents = documents.filter(doc => doc.client_id === clientId)
        }

        // Apply pagination
        const startIndex = (page - 1) * pageSize
        const endIndex = startIndex + pageSize
        const paginatedDocuments = documents.slice(startIndex, endIndex)

        const response: DocumentListResponse = {
            documents: paginatedDocuments,
            total: documents.length,
            page,
            page_size: pageSize,
            total_pages: Math.ceil(documents.length / pageSize)
        }

        console.log(`Retrieved ${paginatedDocuments.length} documents for workspace: ${workspace}`)
        
        return NextResponse.json(response, { status: 200 })

    } catch (error) {
        console.error('Error retrieving documents:', error)
        
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
        { error: 'Method not allowed. Use /api/documents/upload/ for uploading documents.' },
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
