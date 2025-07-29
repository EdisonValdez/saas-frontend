import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mock extracted data based on common tax form fields
    const extractedData = {
      'Client Name': 'ABC Manufacturing LLC',
      'Tax ID': '12-3456789',
      'Business Address': '123 Industrial Way, Suite 100, Springfield, IL 62701',
      'Contact Person': 'John Smith',
      'Contact Email': 'john.smith@abcmfg.com',
      'Contact Phone': '(555) 123-4567',
      'Business Type': 'Limited Liability Company',
      'Tax Year': '2024',
      'Gross Receipts': '$2,450,000',
      'Total Income': '$2,380,000',
      'Total Deductions': '$1,890,000',
      'Net Income': '$490,000',
      'Federal Tax Owed': '$98,000',
      'State Tax Owed': '$24,500',
      'Quarterly Estimated Payments': '$85,000',
      'Employee Count': '15',
      'Industry Code': '333120',
      'Accounting Method': 'Accrual'
    }

    // Mock suggested field mappings with confidence scores
    const suggestedMappings = {
      'Client Name': 'client_name',
      'Tax ID': 'tax_id',
      'Business Address': 'address',
      'Contact Person': 'contact_name',
      'Contact Email': 'email',
      'Contact Phone': 'phone',
      'Business Type': 'entity_type',
      'Tax Year': 'tax_year',
      'Gross Receipts': 'gross_receipts',
      'Total Income': 'total_income',
      'Total Deductions': 'total_deductions',
      'Net Income': 'net_income',
      'Federal Tax Owed': 'federal_tax',
      'State Tax Owed': 'state_tax',
      'Quarterly Estimated Payments': 'quarterly_payments',
      'Employee Count': 'employee_count',
      'Industry Code': 'naics_code',
      'Accounting Method': 'accounting_method'
    }

    // Mock confidence scores for each field
    const confidenceScores = {
      'Client Name': 0.95,
      'Tax ID': 0.98,
      'Business Address': 0.92,
      'Contact Person': 0.88,
      'Contact Email': 0.96,
      'Contact Phone': 0.94,
      'Business Type': 0.91,
      'Tax Year': 0.99,
      'Gross Receipts': 0.87,
      'Total Income': 0.89,
      'Total Deductions': 0.85,
      'Net Income': 0.86,
      'Federal Tax Owed': 0.83,
      'State Tax Owed': 0.84,
      'Quarterly Estimated Payments': 0.82,
      'Employee Count': 0.93,
      'Industry Code': 0.78,
      'Accounting Method': 0.90
    }

    // Simulate validation warnings for problematic data
    const validationWarnings = [
      {
        field: 'Industry Code',
        message: 'NAICS code format should be verified - detected unusual pattern',
        severity: 'warning'
      },
      {
        field: 'Federal Tax Owed',
        message: 'Tax amount seems high relative to net income - please verify',
        severity: 'info'
      },
      {
        field: 'Quarterly Estimated Payments',
        message: 'Estimated payments may be insufficient for calculated tax liability',
        severity: 'warning'
      }
    ]

    return NextResponse.json({
      success: true,
      extractedData,
      suggestedMappings,
      confidenceScores,
      validationWarnings,
      processingDetails: {
        filesProcessed: files.length,
        totalPages: files.length * 2, // Assume 2 pages per file on average
        processingTime: '2.3 seconds',
        ocrConfidence: 0.87
      }
    })

  } catch (error) {
    console.error('Error extracting data from documents:', error)
    return NextResponse.json(
      { error: 'Failed to extract data from documents' },
      { status: 500 }
    )
  }
}
