import { NextRequest, NextResponse } from 'next/server'

interface FormField {
  id: string
  name: string
  label: string
  type: 'text' | 'number' | 'date' | 'checkbox' | 'select'
  value: any
  isRequired: boolean
  isCalculated: boolean
  validation?: {
    pattern?: string
    min?: number
    max?: number
    options?: string[]
  }
  dataSource?: 'client' | 'extracted' | 'calculated' | 'manual'
  confidence?: number
  hasError?: boolean
  errorMessage?: string
  suggestions?: string[]
}

interface FormPreview {
  formId: string
  formNumber: string
  title: string
  templateUrl: string
  fields: FormField[]
  sections: Array<{
    id: string
    title: string
    fieldIds: string[]
  }>
  dataQuality: {
    completeness: number
    accuracy: number
    overallScore: number
  }
  missingFields: string[]
  validationErrors: Array<{
    fieldId: string
    message: string
    severity: 'error' | 'warning' | 'info'
  }>
  calculations: Array<{
    fieldId: string
    formula: string
    dependencies: string[]
    result: any
  }>
}

export async function GET(
  request: NextRequest,
  { params }: { params: { formId: string } }
) {
  try {
    const { formId } = params
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')

    if (!formId) {
      return NextResponse.json(
        { error: 'Form ID is required' },
        { status: 400 }
      )
    }

    // Simulate loading form template and client data
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mock form preview data based on form type
    const formPreview = generateMockFormPreview(formId, clientId)

    return NextResponse.json({
      success: true,
      preview: formPreview
    })

  } catch (error) {
    console.error('Error generating form preview:', error)
    return NextResponse.json(
      { error: 'Failed to generate form preview' },
      { status: 500 }
    )
  }
}

function generateMockFormPreview(formId: string, clientId?: string | null): FormPreview {
  // Mock form templates
  const formTemplates: Record<string, Partial<FormPreview>> = {
    'form-1': {
      formNumber: '1040',
      title: 'U.S. Individual Income Tax Return',
      templateUrl: '/forms/templates/1040-2024.pdf'
    },
    'form-2': {
      formNumber: 'Schedule A',
      title: 'Itemized Deductions',
      templateUrl: '/forms/templates/schedule-a-2024.pdf'
    },
    'form-3': {
      formNumber: '1120',
      title: 'U.S. Corporation Income Tax Return',
      templateUrl: '/forms/templates/1120-2024.pdf'
    },
    'form-8': {
      formNumber: 'Schedule C',
      title: 'Profit or Loss From Business',
      templateUrl: '/forms/templates/schedule-c-2024.pdf'
    }
  }

  const template = formTemplates[formId] || {
    formNumber: 'Unknown',
    title: 'Unknown Form',
    templateUrl: '/forms/templates/generic.pdf'
  }

  // Generate mock fields based on form type
  let fields: FormField[] = []
  let sections: Array<{ id: string; title: string; fieldIds: string[] }> = []

  if (formId === 'form-1') {
    // 1040 Individual Tax Return
    fields = [
      {
        id: 'taxpayer_name',
        name: 'taxpayer_name',
        label: 'Taxpayer Name',
        type: 'text',
        value: 'John A. Smith',
        isRequired: true,
        isCalculated: false,
        dataSource: 'client',
        confidence: 0.95
      },
      {
        id: 'spouse_name',
        name: 'spouse_name',
        label: 'Spouse Name',
        type: 'text',
        value: 'Jane B. Smith',
        isRequired: false,
        isCalculated: false,
        dataSource: 'client',
        confidence: 0.92
      },
      {
        id: 'ssn',
        name: 'ssn',
        label: 'Social Security Number',
        type: 'text',
        value: '123-45-6789',
        isRequired: true,
        isCalculated: false,
        dataSource: 'extracted',
        confidence: 0.98,
        validation: { pattern: '^\\d{3}-\\d{2}-\\d{4}$' }
      },
      {
        id: 'filing_status',
        name: 'filing_status',
        label: 'Filing Status',
        type: 'select',
        value: 'married_filing_jointly',
        isRequired: true,
        isCalculated: false,
        dataSource: 'manual',
        validation: {
          options: ['single', 'married_filing_jointly', 'married_filing_separately', 'head_of_household', 'qualifying_widow']
        }
      },
      {
        id: 'wages',
        name: 'wages',
        label: 'Wages, salaries, tips (Line 1a)',
        type: 'number',
        value: 75000,
        isRequired: false,
        isCalculated: false,
        dataSource: 'extracted',
        confidence: 0.87
      },
      {
        id: 'interest',
        name: 'interest',
        label: 'Taxable interest (Line 2b)',
        type: 'number',
        value: 1250,
        isRequired: false,
        isCalculated: false,
        dataSource: 'extracted',
        confidence: 0.82
      },
      {
        id: 'dividends',
        name: 'dividends',
        label: 'Qualified dividends (Line 3a)',
        type: 'number',
        value: 850,
        isRequired: false,
        isCalculated: false,
        dataSource: 'extracted',
        confidence: 0.79
      },
      {
        id: 'total_income',
        name: 'total_income',
        label: 'Total Income (Line 9)',
        type: 'number',
        value: 77100,
        isRequired: true,
        isCalculated: true,
        dataSource: 'calculated',
        confidence: 1.0
      },
      {
        id: 'standard_deduction',
        name: 'standard_deduction',
        label: 'Standard Deduction (Line 12)',
        type: 'number',
        value: 27700,
        isRequired: true,
        isCalculated: true,
        dataSource: 'calculated',
        confidence: 1.0
      },
      {
        id: 'taxable_income',
        name: 'taxable_income',
        label: 'Taxable Income (Line 15)',
        type: 'number',
        value: 49400,
        isRequired: true,
        isCalculated: true,
        dataSource: 'calculated',
        confidence: 1.0
      }
    ]

    sections = [
      {
        id: 'taxpayer_info',
        title: 'Taxpayer Information',
        fieldIds: ['taxpayer_name', 'spouse_name', 'ssn', 'filing_status']
      },
      {
        id: 'income',
        title: 'Income',
        fieldIds: ['wages', 'interest', 'dividends', 'total_income']
      },
      {
        id: 'deductions',
        title: 'Deductions',
        fieldIds: ['standard_deduction']
      },
      {
        id: 'tax_calculation',
        title: 'Tax Calculation',
        fieldIds: ['taxable_income']
      }
    ]
  } else if (formId === 'form-8') {
    // Schedule C Business Income
    fields = [
      {
        id: 'business_name',
        name: 'business_name',
        label: 'Business Name',
        type: 'text',
        value: 'Smith Consulting Services',
        isRequired: true,
        isCalculated: false,
        dataSource: 'client',
        confidence: 0.94
      },
      {
        id: 'business_ein',
        name: 'business_ein',
        label: 'Employer ID Number',
        type: 'text',
        value: '12-3456789',
        isRequired: false,
        isCalculated: false,
        dataSource: 'extracted',
        confidence: 0.89
      },
      {
        id: 'gross_receipts',
        name: 'gross_receipts',
        label: 'Gross receipts or sales (Line 1)',
        type: 'number',
        value: 125000,
        isRequired: true,
        isCalculated: false,
        dataSource: 'extracted',
        confidence: 0.91
      },
      {
        id: 'office_expenses',
        name: 'office_expenses',
        label: 'Office expenses (Line 18)',
        type: 'number',
        value: 3500,
        isRequired: false,
        isCalculated: false,
        dataSource: 'extracted',
        confidence: 0.73,
        hasError: true,
        errorMessage: 'Amount seems high - please verify'
      },
      {
        id: 'travel_expenses',
        name: 'travel_expenses',
        label: 'Travel expenses (Line 24a)',
        type: 'number',
        value: 2250,
        isRequired: false,
        isCalculated: false,
        dataSource: 'extracted',
        confidence: 0.86
      },
      {
        id: 'total_expenses',
        name: 'total_expenses',
        label: 'Total expenses (Line 28)',
        type: 'number',
        value: 42750,
        isRequired: true,
        isCalculated: true,
        dataSource: 'calculated',
        confidence: 1.0
      },
      {
        id: 'net_profit',
        name: 'net_profit',
        label: 'Net profit or loss (Line 31)',
        type: 'number',
        value: 82250,
        isRequired: true,
        isCalculated: true,
        dataSource: 'calculated',
        confidence: 1.0
      }
    ]

    sections = [
      {
        id: 'business_info',
        title: 'Business Information',
        fieldIds: ['business_name', 'business_ein']
      },
      {
        id: 'income_section',
        title: 'Income',
        fieldIds: ['gross_receipts']
      },
      {
        id: 'expenses_section',
        title: 'Expenses',
        fieldIds: ['office_expenses', 'travel_expenses', 'total_expenses']
      },
      {
        id: 'net_income',
        title: 'Net Income',
        fieldIds: ['net_profit']
      }
    ]
  } else {
    // Generic form
    fields = [
      {
        id: 'generic_field_1',
        name: 'generic_field_1',
        label: 'Sample Field 1',
        type: 'text',
        value: 'Sample Value',
        isRequired: true,
        isCalculated: false,
        dataSource: 'manual'
      },
      {
        id: 'generic_field_2',
        name: 'generic_field_2',
        label: 'Sample Field 2',
        type: 'number',
        value: 1000,
        isRequired: false,
        isCalculated: false,
        dataSource: 'manual'
      }
    ]

    sections = [
      {
        id: 'general',
        title: 'General Information',
        fieldIds: ['generic_field_1', 'generic_field_2']
      }
    ]
  }

  // Calculate data quality metrics
  const totalFields = fields.length
  const completedFields = fields.filter(f => f.value !== null && f.value !== '').length
  const accurateFields = fields.filter(f => !f.hasError).length
  const completeness = totalFields > 0 ? (completedFields / totalFields) * 100 : 0
  const accuracy = totalFields > 0 ? (accurateFields / totalFields) * 100 : 0
  const overallScore = (completeness + accuracy) / 2

  // Identify missing required fields
  const missingFields = fields
    .filter(f => f.isRequired && (!f.value || f.value === ''))
    .map(f => f.label)

  // Generate validation errors
  const validationErrors = fields
    .filter(f => f.hasError)
    .map(f => ({
      fieldId: f.id,
      message: f.errorMessage || 'Validation error',
      severity: 'warning' as const
    }))

  // Generate calculations
  const calculations = fields
    .filter(f => f.isCalculated)
    .map(f => ({
      fieldId: f.id,
      formula: getFormulaForField(f.id),
      dependencies: getDependenciesForField(f.id, fields),
      result: f.value
    }))

  return {
    formId,
    formNumber: template.formNumber!,
    title: template.title!,
    templateUrl: template.templateUrl!,
    fields,
    sections,
    dataQuality: {
      completeness: Math.round(completeness),
      accuracy: Math.round(accuracy),
      overallScore: Math.round(overallScore)
    },
    missingFields,
    validationErrors,
    calculations
  }
}

function getFormulaForField(fieldId: string): string {
  const formulas: Record<string, string> = {
    'total_income': 'wages + interest + dividends + other_income',
    'taxable_income': 'total_income - standard_deduction - itemized_deductions',
    'total_expenses': 'SUM(all_expense_fields)',
    'net_profit': 'gross_receipts - total_expenses'
  }

  return formulas[fieldId] || 'Unknown calculation'
}

function getDependenciesForField(fieldId: string, fields: FormField[]): string[] {
  const dependencies: Record<string, string[]> = {
    'total_income': ['wages', 'interest', 'dividends'],
    'taxable_income': ['total_income', 'standard_deduction'],
    'total_expenses': ['office_expenses', 'travel_expenses'],
    'net_profit': ['gross_receipts', 'total_expenses']
  }

  return dependencies[fieldId] || []
}
