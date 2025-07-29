import { NextRequest, NextResponse } from 'next/server'

interface MappingConfirmation {
  sessionId: string
  mappings: Record<string, string>
  extractedData: Record<string, any>
  overrides: Record<string, any>
}

export async function POST(request: NextRequest) {
  try {
    const body: MappingConfirmation = await request.json()
    const { sessionId, mappings, extractedData, overrides } = body

    if (!sessionId || !mappings) {
      return NextResponse.json(
        { error: 'Session ID and mappings are required' },
        { status: 400 }
      )
    }

    // Simulate processing the mapping confirmation
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Apply mappings and overrides to create final structured data
    const structuredData: Record<string, any> = {}
    
    // Apply field mappings
    Object.entries(mappings).forEach(([sourceField, targetField]) => {
      if (targetField !== 'ignore' && extractedData[sourceField] !== undefined) {
        structuredData[targetField] = extractedData[sourceField]
      }
    })

    // Apply any manual overrides
    Object.entries(overrides || {}).forEach(([field, value]) => {
      structuredData[field] = value
    })

    // Perform data validation and transformation
    const validationResults = validateStructuredData(structuredData)
    
    // Calculate data quality score
    const dataQualityScore = calculateDataQuality(structuredData, mappings)

    return NextResponse.json({
      success: true,
      structuredData,
      validationResults,
      dataQualityScore,
      statistics: {
        totalFields: Object.keys(extractedData).length,
        mappedFields: Object.values(mappings).filter(v => v !== 'ignore').length,
        ignoredFields: Object.values(mappings).filter(v => v === 'ignore').length,
        overriddenFields: Object.keys(overrides || {}).length,
        requiredFieldsComplete: calculateRequiredFieldsCompletion(structuredData)
      },
      next_steps: [
        'Review client profile for accuracy',
        'Set up initial tax planning session',
        'Configure document management preferences',
        'Send welcome email with portal access'
      ]
    })

  } catch (error) {
    console.error('Error confirming data mapping:', error)
    return NextResponse.json(
      { error: 'Failed to confirm data mapping' },
      { status: 500 }
    )
  }
}

function validateStructuredData(data: Record<string, any>) {
  const validationResults = {
    errors: [] as Array<{field: string, message: string, severity: 'error' | 'warning' | 'info'}>,
    warnings: [] as Array<{field: string, message: string, severity: 'error' | 'warning' | 'info'}>,
    isValid: true
  }

  // Required fields validation
  const requiredFields = ['client_name', 'tax_id', 'contact_name', 'email']
  requiredFields.forEach(field => {
    if (!data[field] || String(data[field]).trim() === '') {
      validationResults.errors.push({
        field,
        message: `${field.replace('_', ' ').toUpperCase()} is required`,
        severity: 'error'
      })
    }
  })

  // Email validation
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    validationResults.errors.push({
      field: 'email',
      message: 'Invalid email format',
      severity: 'error'
    })
  }

  // Tax ID validation
  if (data.tax_id) {
    const taxId = String(data.tax_id).replace(/[-\s]/g, '')
    if (taxId.length === 9 && /^\d{9}$/.test(taxId)) {
      // Valid SSN or EIN format
    } else {
      validationResults.warnings.push({
        field: 'tax_id',
        message: 'Tax ID format should be verified',
        severity: 'warning'
      })
    }
  }

  // Phone validation
  if (data.phone && !/^[\+]?[\d\s\-\(\)\.]{10,}$/.test(data.phone)) {
    validationResults.warnings.push({
      field: 'phone',
      message: 'Phone number format should be verified',
      severity: 'warning'
    })
  }

  // Financial data validation
  if (data.total_income && data.net_income) {
    const totalIncome = parseFloat(String(data.total_income).replace(/[$,]/g, ''))
    const netIncome = parseFloat(String(data.net_income).replace(/[$,]/g, ''))
    
    if (netIncome > totalIncome) {
      validationResults.warnings.push({
        field: 'net_income',
        message: 'Net income cannot exceed total income',
        severity: 'warning'
      })
    }
  }

  validationResults.isValid = validationResults.errors.length === 0

  return validationResults
}

function calculateDataQuality(data: Record<string, any>, mappings: Record<string, string>): number {
  const totalPossibleFields = Object.keys(mappings).length
  const mappedFields = Object.values(mappings).filter(v => v !== 'ignore').length
  const populatedFields = Object.values(data).filter(v => v !== null && v !== undefined && String(v).trim() !== '').length
  
  // Calculate completion percentage
  const completionScore = mappedFields > 0 ? (populatedFields / mappedFields) : 0
  
  // Bonus for required fields
  const requiredFields = ['client_name', 'tax_id', 'contact_name', 'email']
  const requiredFieldsPresent = requiredFields.filter(field => 
    data[field] && String(data[field]).trim() !== ''
  ).length
  const requiredBonus = requiredFieldsPresent / requiredFields.length * 0.2
  
  return Math.min(1, completionScore + requiredBonus)
}

function calculateRequiredFieldsCompletion(data: Record<string, any>): number {
  const requiredFields = ['client_name', 'tax_id', 'contact_name', 'email']
  const completedFields = requiredFields.filter(field => 
    data[field] && String(data[field]).trim() !== ''
  ).length
  
  return completedFields / requiredFields.length
}
