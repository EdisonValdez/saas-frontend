import { NextRequest, NextResponse } from 'next/server'

interface OCRResult {
  extractedText: string
  keyFields: Record<string, any>
  confidence: number
  documentType: string
  suggestions: string[]
  formMappings: Array<{
    field: string
    value: any
    formSection: string
    confidence: number
  }>
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload PDF, JPG, PNG, or TIFF files.' },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Simulate OCR processing time
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mock OCR result based on filename patterns
    const ocrResult = generateMockOCRResult(file.name, file.type)

    return NextResponse.json({
      success: true,
      ocrResult,
      processingTime: '2.3 seconds',
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type
      }
    })

  } catch (error) {
    console.error('Error processing document OCR:', error)
    return NextResponse.json(
      { error: 'Failed to process document OCR' },
      { status: 500 }
    )
  }
}

function generateMockOCRResult(filename: string, fileType: string): OCRResult {
  const filenameLower = filename.toLowerCase()
  
  // W-2 Form Mock
  if (filenameLower.includes('w-2') || filenameLower.includes('w2')) {
    return {
      extractedText: `Form W-2 Wage and Tax Statement
      Employer: ABC Manufacturing Corp
      EIN: 12-3456789
      Employee: John A. Smith
      SSN: ***-**-6789
      Wages: $75,000.00
      Federal Income Tax Withheld: $8,250.00
      Social Security Wages: $75,000.00
      Social Security Tax Withheld: $4,650.00
      Medicare Wages: $75,000.00
      Medicare Tax Withheld: $1,087.50
      State: IL
      State Wages: $75,000.00
      State Income Tax: $2,625.00`,
      keyFields: {
        documentType: 'W-2',
        employerName: 'ABC Manufacturing Corp',
        employerEIN: '12-3456789',
        employeeName: 'John A. Smith',
        employeeSSN: '***-**-6789',
        wages: 75000,
        federalWithheld: 8250,
        socialSecurityWages: 75000,
        socialSecurityWithheld: 4650,
        medicareWages: 75000,
        medicareWithheld: 1087.50,
        state: 'IL',
        stateWages: 75000,
        stateWithheld: 2625,
        taxYear: 2024
      },
      confidence: 0.94,
      documentType: 'W-2',
      suggestions: [
        'This W-2 shows $75,000 in wages and $8,250 in federal withholding',
        'Report wages on Form 1040, line 1a',
        'Report federal withholding on Form 1040, line 25a',
        'Check if additional state return filing is required for Illinois'
      ],
      formMappings: [
        {
          field: 'wages',
          value: 75000,
          formSection: 'Form 1040, Line 1a - Wages, salaries, tips',
          confidence: 0.98
        },
        {
          field: 'federalWithheld',
          value: 8250,
          formSection: 'Form 1040, Line 25a - Federal income tax withheld',
          confidence: 0.98
        },
        {
          field: 'socialSecurityWithheld',
          value: 4650,
          formSection: 'Form 1040, Line 25b - Social Security tax withheld',
          confidence: 0.95
        },
        {
          field: 'medicareWithheld',
          value: 1087.50,
          formSection: 'Form 1040, Line 25c - Medicare tax withheld',
          confidence: 0.95
        }
      ]
    }
  }

  // 1099-MISC Form Mock
  if (filenameLower.includes('1099') || filenameLower.includes('misc')) {
    return {
      extractedText: `Form 1099-MISC Miscellaneous Income
      Payer: XYZ Consulting Services
      TIN: 98-7654321
      Recipient: Jane B. Smith
      TIN: ***-**-1234
      Nonemployee compensation: $25,000.00
      Federal income tax withheld: $0.00
      State tax withheld: $0.00`,
      keyFields: {
        documentType: '1099-MISC',
        payerName: 'XYZ Consulting Services',
        payerTIN: '98-7654321',
        recipientName: 'Jane B. Smith',
        recipientTIN: '***-**-1234',
        nonemployeeCompensation: 25000,
        federalWithheld: 0,
        stateWithheld: 0,
        taxYear: 2024
      },
      confidence: 0.91,
      documentType: '1099-MISC',
      suggestions: [
        'This 1099-MISC shows $25,000 in nonemployee compensation',
        'Report on Schedule C if this is business income',
        'You may need to pay self-employment tax',
        'Consider making quarterly estimated tax payments',
        'Keep records of business expenses to offset this income'
      ],
      formMappings: [
        {
          field: 'nonemployeeCompensation',
          value: 25000,
          formSection: 'Schedule C, Line 1 - Gross receipts or sales',
          confidence: 0.92
        },
        {
          field: 'selfEmploymentTax',
          value: 3532.50,
          formSection: 'Schedule SE - Self-Employment Tax',
          confidence: 0.88
        }
      ]
    }
  }

  // Bank Statement Mock
  if (filenameLower.includes('bank') || filenameLower.includes('statement')) {
    return {
      extractedText: `First National Bank
      Statement Period: 01/01/2024 - 01/31/2024
      Account: Business Checking ***1234
      Beginning Balance: $5,240.18
      Total Deposits: $12,500.00
      Total Withdrawals: $8,750.00
      Ending Balance: $8,990.18
      
      Notable Transactions:
      01/05 - Office Supplies Store - $245.67
      01/12 - Business Lunch - $89.50
      01/18 - Software Subscription - $299.00
      01/25 - Client Payment Deposit - $5,000.00`,
      keyFields: {
        documentType: 'Bank Statement',
        accountType: 'Business Checking',
        statementPeriod: '01/01/2024 - 01/31/2024',
        beginningBalance: 5240.18,
        totalDeposits: 12500.00,
        totalWithdrawals: 8750.00,
        endingBalance: 8990.18,
        businessExpenses: 634.17,
        income: 5000.00
      },
      confidence: 0.87,
      documentType: 'Bank Statement',
      suggestions: [
        'Identified $634.17 in potential business expenses',
        'Consider categorizing expenses for tax deductions',
        'Office supplies ($245.67) may be fully deductible',
        'Business meals ($89.50) are 50% deductible',
        'Software subscriptions ($299.00) are typically deductible',
        'Keep receipts for all business expense claims'
      ],
      formMappings: [
        {
          field: 'officeSupplies',
          value: 245.67,
          formSection: 'Schedule C, Line 18 - Office expense',
          confidence: 0.85
        },
        {
          field: 'businessMeals',
          value: 44.75,
          formSection: 'Schedule C, Line 24b - Meals (50% limitation)',
          confidence: 0.82
        },
        {
          field: 'software',
          value: 299.00,
          formSection: 'Schedule C, Line 27a - Other expenses',
          confidence: 0.88
        }
      ]
    }
  }

  // Receipt Mock
  if (filenameLower.includes('receipt') || filenameLower.includes('invoice')) {
    return {
      extractedText: `OFFICE DEPOT
      Store #1234
      123 Main Street
      Chicago, IL 60601
      
      Date: 03/15/2024
      Time: 14:32
      
      ITEMS PURCHASED:
      HP Printer Paper (5 reams) - $45.99
      Stapler - $12.99
      Pens (box of 12) - $8.50
      File folders (25 pack) - $15.99
      
      Subtotal: $83.47
      Tax: $7.51
      Total: $90.98
      
      Payment: Credit Card ****1234
      Thank you for your business!`,
      keyFields: {
        documentType: 'Receipt',
        vendor: 'Office Depot',
        date: '2024-03-15',
        items: [
          { description: 'HP Printer Paper', quantity: 5, price: 45.99 },
          { description: 'Stapler', quantity: 1, price: 12.99 },
          { description: 'Pens', quantity: 1, price: 8.50 },
          { description: 'File folders', quantity: 1, price: 15.99 }
        ],
        subtotal: 83.47,
        tax: 7.51,
        total: 90.98,
        category: 'Office Supplies'
      },
      confidence: 0.89,
      documentType: 'Receipt',
      suggestions: [
        'This appears to be a business office supplies purchase',
        'Total expense: $90.98 including tax',
        'All items appear to be legitimate business expenses',
        'Keep this receipt for tax documentation',
        'Consider digital storage for easy retrieval'
      ],
      formMappings: [
        {
          field: 'officeExpense',
          value: 90.98,
          formSection: 'Schedule C, Line 18 - Office expense',
          confidence: 0.92
        }
      ]
    }
  }

  // Property Tax Bill Mock
  if (filenameLower.includes('property') || filenameLower.includes('tax')) {
    return {
      extractedText: `Cook County Property Tax Bill
      Tax Year: 2024
      Property Address: 456 Oak Street, Chicago, IL 60614
      PIN: 17-03-201-025-0000
      
      Assessment Information:
      Land Value: $150,000
      Building Value: $350,000
      Total Assessed Value: $500,000
      
      Tax Calculation:
      County Tax: $3,250.00
      Municipal Tax: $4,100.00
      School District: $8,750.00
      Special Assessments: $425.00
      
      Total Tax Due: $16,525.00
      Due Date: 08/01/2024`,
      keyFields: {
        documentType: 'Property Tax Bill',
        taxYear: 2024,
        propertyAddress: '456 Oak Street, Chicago, IL 60614',
        totalAssessedValue: 500000,
        countyTax: 3250,
        municipalTax: 4100,
        schoolTax: 8750,
        specialAssessments: 425,
        totalTaxDue: 16525,
        dueDate: '2024-08-01'
      },
      confidence: 0.93,
      documentType: 'Property Tax Bill',
      suggestions: [
        'Property tax of $16,525 may be deductible',
        'Check SALT (State and Local Tax) deduction limits',
        'SALT deduction is capped at $10,000 for federal returns',
        'Consider timing of payment for tax planning',
        'Keep payment records for tax documentation'
      ],
      formMappings: [
        {
          field: 'stateLocalTax',
          value: 16525,
          formSection: 'Schedule A, Line 5b - State and local real estate taxes',
          confidence: 0.95
        }
      ]
    }
  }

  // Generic document fallback
  return {
    extractedText: `Document content extracted from ${filename}
    This appears to be a tax-related document that may contain important information for your tax return.
    Please review the extracted data for accuracy.`,
    keyFields: {
      documentType: 'Unknown',
      filename: filename,
      processed: true
    },
    confidence: 0.65,
    documentType: 'Unknown',
    suggestions: [
      'Document uploaded successfully',
      'Please verify the extracted information',
      'Contact support if OCR results seem incorrect',
      'Consider providing more context about this document'
    ],
    formMappings: []
  }
}
