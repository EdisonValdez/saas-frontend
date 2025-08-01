/**
 * Compatibility layer to bridge between original implementation and backend-aligned version
 * This allows gradual migration while maintaining existing functionality
 */

import type { TaxFormTemplate as OriginalTemplate } from '@/types/tax-forms'
import type { TaxFormTemplate as BackendTemplate } from '@/types/tax-forms-backend'

/**
 * Convert backend template format to original format
 */
export function convertBackendToOriginal(backendTemplate: BackendTemplate): OriginalTemplate {
    return {
        id: backendTemplate.id,
        name: backendTemplate.form_name,
        form_number: backendTemplate.form_number,
        tax_year: backendTemplate.tax_year,
        version: backendTemplate.current_version?.version_number.toString() || '1.0',
        description: backendTemplate.description || '',
        category: backendTemplate.category || backendTemplate.jurisdiction || 'General',
        complexity: mapComplexity(backendTemplate.category),
        estimated_time: estimateTimeFromMapping(backendTemplate.field_mapping),
        filing_status: extractFilingStatus(backendTemplate.field_mapping),
        sections: convertFieldMappingToSections(backendTemplate.field_mapping),
        metadata: {
            created_by: backendTemplate.current_version?.created_by || 'system',
            created_at: backendTemplate.created_at,
            last_modified: backendTemplate.updated_at,
            last_modified_by: backendTemplate.current_version?.created_by_name || 'system',
            source_file_path: backendTemplate.template_file,
            is_active: backendTemplate.is_active,
        },
    }
}

/**
 * Convert original template format to backend format
 */
export function convertOriginalToBackend(originalTemplate: OriginalTemplate): BackendTemplate {
    return {
        id: originalTemplate.id,
        form_number: originalTemplate.form_number,
        form_name: originalTemplate.name,
        tax_year: originalTemplate.tax_year,
        template_file: originalTemplate.metadata.source_file_path || '',
        field_mapping: convertSectionsToFieldMapping(originalTemplate.sections),
        is_active: originalTemplate.metadata.is_active,
        created_at: originalTemplate.metadata.created_at,
        updated_at: originalTemplate.metadata.last_modified,
        description: originalTemplate.description,
        category: originalTemplate.category,
        jurisdiction: originalTemplate.category,
        current_version: {
            id: `${originalTemplate.id}_v${originalTemplate.version}`,
            template: originalTemplate.id,
            version_number: parseFloat(originalTemplate.version) || 1,
            created_by: originalTemplate.metadata.created_by,
            created_by_name: originalTemplate.metadata.last_modified_by,
            field_mapping: convertSectionsToFieldMapping(originalTemplate.sections),
            change_notes: 'Converted from original format',
            is_active: originalTemplate.metadata.is_active,
            created_at: originalTemplate.metadata.created_at,
        },
    }
}

/**
 * Map category to complexity level
 */
function mapComplexity(category?: string): 'simple' | 'intermediate' | 'complex' {
    if (!category) return 'intermediate'

    const simpleCategories = ['individual', 'simple', 'basic']
    const complexCategories = ['business', 'corporation', 'partnership', 'complex', 'advanced']

    const lowerCategory = category.toLowerCase()

    if (simpleCategories.some((cat) => lowerCategory.includes(cat))) {
        return 'simple'
    } else if (complexCategories.some((cat) => lowerCategory.includes(cat))) {
        return 'complex'
    }

    return 'intermediate'
}

/**
 * Estimate time based on field mapping complexity
 */
function estimateTimeFromMapping(fieldMapping: Record<string, any>): number {
    const fieldCount = Object.keys(fieldMapping).length

    if (fieldCount < 10) return 30 // 30 minutes
    if (fieldCount < 25) return 90 // 1.5 hours
    if (fieldCount < 50) return 180 // 3 hours
    return 360 // 6 hours
}

/**
 * Extract filing status from field mapping
 */
function extractFilingStatus(fieldMapping: Record<string, any>): string[] {
    const filingStatusField = fieldMapping['filing_status'] || fieldMapping['status'] || fieldMapping['filing_type']

    if (filingStatusField && Array.isArray(filingStatusField.options)) {
        return filingStatusField.options
    }

    // Default filing statuses
    return ['single', 'married_filing_jointly', 'married_filing_separately', 'head_of_household']
}

/**
 * Convert field mapping to sections format
 */
function convertFieldMappingToSections(fieldMapping: Record<string, any>): OriginalTemplate['sections'] {
    const sections: OriginalTemplate['sections'] = []

    // Group fields by logical sections
    const sectionGroups: Record<string, any[]> = {
        personal_info: [],
        income: [],
        deductions: [],
        calculations: [],
        other: [],
    }

    Object.entries(fieldMapping).forEach(([key, field]) => {
        const sectionName = determineSectionFromFieldName(key)
        sectionGroups[sectionName].push({
            id: key,
            name: key,
            label: field.label || formatLabel(key),
            type: field.type || 'text',
            required: field.required || false,
            description: field.description,
            validation: field.validation,
            options: field.options,
            calculation: field.calculation,
            dependencies: field.dependencies,
        })
    })

    Object.entries(sectionGroups).forEach(([sectionName, fields], index) => {
        if (fields.length > 0) {
            sections.push({
                id: sectionName,
                name: sectionName,
                title: formatSectionTitle(sectionName),
                description: getSectionDescription(sectionName),
                order: index,
                fields,
            })
        }
    })

    return sections
}

/**
 * Convert sections to field mapping format
 */
function convertSectionsToFieldMapping(sections: OriginalTemplate['sections']): Record<string, any> {
    const fieldMapping: Record<string, any> = {}

    sections.forEach((section) => {
        section.fields.forEach((field) => {
            fieldMapping[field.name] = {
                label: field.label,
                type: field.type,
                required: field.required,
                description: field.description,
                validation: field.validation,
                options: field.options,
                calculation: field.calculation,
                dependencies: field.dependencies,
                section: section.name,
            }
        })
    })

    return fieldMapping
}

/**
 * Determine section based on field name
 */
function determineSectionFromFieldName(fieldName: string): string {
    const personalFields = ['name', 'ssn', 'dob', 'address', 'phone', 'email', 'filing_status']
    const incomeFields = ['wages', 'salary', 'interest', 'dividend', 'business_income', 'rental']
    const deductionFields = ['deduction', 'itemized', 'standard', 'charity', 'mortgage']
    const calculationFields = ['tax', 'credit', 'refund', 'owed', 'total', 'subtotal']

    const lowerFieldName = fieldName.toLowerCase()

    if (personalFields.some((field) => lowerFieldName.includes(field))) {
        return 'personal_info'
    } else if (incomeFields.some((field) => lowerFieldName.includes(field))) {
        return 'income'
    } else if (deductionFields.some((field) => lowerFieldName.includes(field))) {
        return 'deductions'
    } else if (calculationFields.some((field) => lowerFieldName.includes(field))) {
        return 'calculations'
    }

    return 'other'
}

/**
 * Format field name as label
 */
function formatLabel(fieldName: string): string {
    return fieldName
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

/**
 * Format section title
 */
function formatSectionTitle(sectionName: string): string {
    const titles: Record<string, string> = {
        personal_info: 'Personal Information',
        income: 'Income',
        deductions: 'Deductions',
        calculations: 'Tax Calculations',
        other: 'Additional Information',
    }

    return titles[sectionName] || formatLabel(sectionName)
}

/**
 * Get section description
 */
function getSectionDescription(sectionName: string): string {
    const descriptions: Record<string, string> = {
        personal_info: 'Basic taxpayer information and filing status',
        income: 'All sources of taxable income',
        deductions: 'Deductions and credits to reduce tax liability',
        calculations: 'Tax calculations and final amounts',
        other: 'Additional required information',
    }

    return descriptions[sectionName] || ''
}

/**
 * Batch convert multiple templates
 */
export function convertBackendTemplatesBatch(templates: BackendTemplate[]): OriginalTemplate[] {
    return templates.map(convertBackendToOriginal)
}

export function convertOriginalTemplatesBatch(templates: OriginalTemplate[]): BackendTemplate[] {
    return templates.map(convertOriginalToBackend)
}
