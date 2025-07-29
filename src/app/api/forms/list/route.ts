import { NextRequest, NextResponse } from 'next/server'

// Mock tax forms data
const mockForms = [
  {
    id: 'form-1',
    formNumber: '1040',
    title: 'U.S. Individual Income Tax Return',
    description: 'Standard individual tax return for reporting income, deductions, and calculating tax liability',
    category: 'income',
    entityTypes: ['individual'],
    jurisdiction: 'federal',
    year: 2024,
    complexity: 'moderate',
    estimatedTime: 45,
    completionStatus: 'in_progress',
    completionPercentage: 65,
    lastModified: '2024-01-15T10:30:00Z',
    version: '2024.1',
    requirements: ['W-2 forms', '1099 forms', 'Expense receipts'],
    relatedForms: ['Schedule A', 'Schedule B', 'Schedule D'],
    filingDeadline: '2024-04-15',
    isRequired: true,
    status: 'draft',
    isRecentlyUsed: true,
    isRecommended: true,
    isBookmarked: false,
    tags: ['individual', 'income', 'federal', 'required']
  },
  {
    id: 'form-2',
    formNumber: 'Schedule A',
    title: 'Itemized Deductions',
    description: 'Detailed listing of allowable deductions including medical, taxes, interest, and charitable contributions',
    category: 'deduction',
    entityTypes: ['individual'],
    jurisdiction: 'federal',
    year: 2024,
    complexity: 'simple',
    estimatedTime: 25,
    completionStatus: 'completed',
    completionPercentage: 100,
    lastModified: '2024-01-12T14:20:00Z',
    version: '2024.1',
    requirements: ['Medical receipts', 'Property tax statements', 'Mortgage interest statements'],
    relatedForms: ['1040', 'Form 8283'],
    filingDeadline: '2024-04-15',
    isRequired: false,
    status: 'finalized',
    isRecentlyUsed: true,
    isRecommended: false,
    isBookmarked: true,
    tags: ['deductions', 'itemized', 'medical', 'charitable']
  },
  {
    id: 'form-3',
    formNumber: '1120',
    title: 'U.S. Corporation Income Tax Return',
    description: 'Corporate income tax return for C-corporations reporting business income and expenses',
    category: 'income',
    entityTypes: ['business'],
    jurisdiction: 'federal',
    year: 2024,
    complexity: 'complex',
    estimatedTime: 120,
    completionStatus: 'not_started',
    completionPercentage: 0,
    lastModified: null,
    version: '2024.1',
    requirements: ['Financial statements', 'General ledger', 'Depreciation schedules'],
    relatedForms: ['Schedule M-1', 'Schedule M-3', 'Form 4562'],
    filingDeadline: '2024-03-15',
    isRequired: true,
    status: 'draft',
    isRecentlyUsed: false,
    isRecommended: true,
    isBookmarked: false,
    tags: ['corporation', 'business', 'income', 'complex']
  },
  {
    id: 'form-4',
    formNumber: '1065',
    title: 'U.S. Return of Partnership Income',
    description: 'Partnership tax return for reporting partnership income, deductions, and distributions',
    category: 'income',
    entityTypes: ['partnership'],
    jurisdiction: 'federal',
    year: 2024,
    complexity: 'complex',
    estimatedTime: 90,
    completionStatus: 'in_progress',
    completionPercentage: 30,
    lastModified: '2024-01-10T09:15:00Z',
    version: '2024.1',
    requirements: ['Partnership agreement', 'Books and records', 'K-1 preparation'],
    relatedForms: ['Schedule K-1', 'Form 8865'],
    filingDeadline: '2024-03-15',
    isRequired: true,
    status: 'review',
    isRecentlyUsed: true,
    isRecommended: false,
    isBookmarked: true,
    tags: ['partnership', 'business', 'k1', 'distribution']
  },
  {
    id: 'form-5',
    formNumber: '8862',
    title: 'Information To Claim Earned Income Credit After Disallowance',
    description: 'Required form for taxpayers whose EIC was previously disallowed or reduced',
    category: 'credit',
    entityTypes: ['individual'],
    jurisdiction: 'federal',
    year: 2024,
    complexity: 'simple',
    estimatedTime: 15,
    completionStatus: 'not_started',
    completionPercentage: 0,
    lastModified: null,
    version: '2024.1',
    requirements: ['Previous year tax return', 'Supporting documentation'],
    relatedForms: ['1040', 'Schedule EIC'],
    filingDeadline: '2024-04-15',
    isRequired: false,
    status: 'draft',
    isRecentlyUsed: false,
    isRecommended: false,
    isBookmarked: false,
    tags: ['credit', 'earned income', 'disallowance']
  },
  {
    id: 'form-6',
    formNumber: '1041',
    title: 'U.S. Income Tax Return for Estates and Trusts',
    description: 'Income tax return for estates and trusts reporting income and distributions',
    category: 'income',
    entityTypes: ['trust'],
    jurisdiction: 'federal',
    year: 2024,
    complexity: 'complex',
    estimatedTime: 105,
    completionStatus: 'in_progress',
    completionPercentage: 45,
    lastModified: '2024-01-08T16:45:00Z',
    version: '2024.1',
    requirements: ['Trust agreement', 'Financial records', 'Beneficiary information'],
    relatedForms: ['Schedule K-1', 'Form 706'],
    filingDeadline: '2024-04-15',
    isRequired: true,
    status: 'review',
    isRecentlyUsed: false,
    isRecommended: true,
    isBookmarked: false,
    tags: ['trust', 'estate', 'fiduciary', 'distribution']
  },
  {
    id: 'form-7',
    formNumber: '1099-MISC',
    title: 'Miscellaneous Income',
    description: 'Information return for reporting miscellaneous income payments',
    category: 'information',
    entityTypes: ['business', 'individual'],
    jurisdiction: 'federal',
    year: 2024,
    complexity: 'simple',
    estimatedTime: 10,
    completionStatus: 'completed',
    completionPercentage: 100,
    lastModified: '2024-01-05T11:20:00Z',
    version: '2024.1',
    requirements: ['Payment records', 'Recipient TIN'],
    relatedForms: ['1096', 'W-9'],
    filingDeadline: '2024-01-31',
    isRequired: true,
    status: 'filed',
    isRecentlyUsed: true,
    isRecommended: false,
    isBookmarked: false,
    tags: ['information', 'misc income', 'contractor', 'payment']
  },
  {
    id: 'form-8',
    formNumber: 'Schedule C',
    title: 'Profit or Loss From Business',
    description: 'Business income and expense reporting for sole proprietorships',
    category: 'income',
    entityTypes: ['individual'],
    jurisdiction: 'federal',
    year: 2024,
    complexity: 'moderate',
    estimatedTime: 60,
    completionStatus: 'in_progress',
    completionPercentage: 75,
    lastModified: '2024-01-14T13:30:00Z',
    version: '2024.1',
    requirements: ['Business records', 'Expense receipts', 'Mileage logs'],
    relatedForms: ['1040', 'Schedule SE', 'Form 8829'],
    filingDeadline: '2024-04-15',
    isRequired: false,
    status: 'draft',
    isRecentlyUsed: true,
    isRecommended: true,
    isBookmarked: true,
    tags: ['business', 'sole proprietor', 'schedule c', 'self employed']
  },
  {
    id: 'form-9',
    formNumber: '2120',
    title: 'Multiple Support Declaration',
    description: 'Declaration for claiming dependency exemption when multiple people provide support',
    category: 'deduction',
    entityTypes: ['individual'],
    jurisdiction: 'federal',
    year: 2024,
    complexity: 'simple',
    estimatedTime: 20,
    completionStatus: 'not_started',
    completionPercentage: 0,
    lastModified: null,
    version: '2024.1',
    requirements: ['Support documentation', 'Other contributors agreement'],
    relatedForms: ['1040'],
    filingDeadline: '2024-04-15',
    isRequired: false,
    status: 'draft',
    isRecentlyUsed: false,
    isRecommended: false,
    isBookmarked: false,
    tags: ['dependency', 'support', 'multiple', 'family']
  },
  {
    id: 'form-10',
    formNumber: '8938',
    title: 'Statement of Specified Foreign Financial Assets',
    description: 'Required reporting of foreign financial assets above certain thresholds',
    category: 'information',
    entityTypes: ['individual', 'business'],
    jurisdiction: 'federal',
    year: 2024,
    complexity: 'complex',
    estimatedTime: 75,
    completionStatus: 'not_started',
    completionPercentage: 0,
    lastModified: null,
    version: '2024.1',
    requirements: ['Foreign account statements', 'Asset valuations', 'Currency conversions'],
    relatedForms: ['1040', 'FBAR'],
    filingDeadline: '2024-04-15',
    isRequired: false,
    status: 'draft',
    isRecentlyUsed: false,
    isRecommended: false,
    isBookmarked: false,
    tags: ['foreign', 'assets', 'reporting', 'international']
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract query parameters for filtering
    const category = searchParams.get('category')
    const entityType = searchParams.get('entityType')
    const jurisdiction = searchParams.get('jurisdiction')
    const year = searchParams.get('year')
    const complexity = searchParams.get('complexity')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    let filteredForms = [...mockForms]

    // Apply filters
    if (category) {
      filteredForms = filteredForms.filter(form => form.category === category)
    }

    if (entityType) {
      filteredForms = filteredForms.filter(form => form.entityTypes.includes(entityType))
    }

    if (jurisdiction) {
      filteredForms = filteredForms.filter(form => form.jurisdiction === jurisdiction)
    }

    if (year) {
      filteredForms = filteredForms.filter(form => form.year.toString() === year)
    }

    if (complexity) {
      filteredForms = filteredForms.filter(form => form.complexity === complexity)
    }

    if (status) {
      filteredForms = filteredForms.filter(form => form.status === status)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filteredForms = filteredForms.filter(form =>
        form.formNumber.toLowerCase().includes(searchLower) ||
        form.title.toLowerCase().includes(searchLower) ||
        form.description.toLowerCase().includes(searchLower) ||
        form.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    // Calculate statistics
    const statistics = {
      total: filteredForms.length,
      byCategory: {
        income: filteredForms.filter(f => f.category === 'income').length,
        deduction: filteredForms.filter(f => f.category === 'deduction').length,
        credit: filteredForms.filter(f => f.category === 'credit').length,
        information: filteredForms.filter(f => f.category === 'information').length
      },
      byStatus: {
        draft: filteredForms.filter(f => f.status === 'draft').length,
        review: filteredForms.filter(f => f.status === 'review').length,
        finalized: filteredForms.filter(f => f.status === 'finalized').length,
        filed: filteredForms.filter(f => f.status === 'filed').length
      },
      byCompletion: {
        not_started: filteredForms.filter(f => f.completionStatus === 'not_started').length,
        in_progress: filteredForms.filter(f => f.completionStatus === 'in_progress').length,
        completed: filteredForms.filter(f => f.completionStatus === 'completed').length,
        filed: filteredForms.filter(f => f.completionStatus === 'filed').length
      }
    }

    return NextResponse.json({
      success: true,
      forms: filteredForms,
      statistics,
      totalCount: mockForms.length,
      filteredCount: filteredForms.length
    })

  } catch (error) {
    console.error('Error fetching forms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch forms' },
      { status: 500 }
    )
  }
}
