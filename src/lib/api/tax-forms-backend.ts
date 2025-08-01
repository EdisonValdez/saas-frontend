import { enhancedApiClient } from '@/lib/api-client-enhanced'
import type {
    TaxFormTemplate,
    TaxFormTemplateVersion,
    TaxFormTemplateListParams,
    TemplatesByYearResponse,
    ApiResponse,
    TemplateCache,
} from '@/types/tax-forms-backend'

// Cache for templates
const templateCache = new Map<string, TemplateCache>()
const CACHE_DURATION = 15 * 60 * 1000 // 15 minutes

/**
 * Generic API request wrapper
 */
async function apiRequest<T>(endpoint: string): Promise<T> {
    const response = await enhancedApiClient.request<T>(endpoint)

    if (!response.success) {
        throw new Error(response.error || 'API request failed')
    }

    return response.data as T
}

/**
 * Get all tax form templates
 */
export async function getTaxFormTemplates(params?: TaxFormTemplateListParams): Promise<TaxFormTemplate[]> {
    let queryString = ''

    if (params) {
        const queryParams = new URLSearchParams()
        if (params.tax_year) queryParams.append('tax_year', params.tax_year.toString())
        if (params.jurisdiction) queryParams.append('jurisdiction', params.jurisdiction)
        if (params.is_active !== undefined) queryParams.append('is_active', params.is_active.toString())
        queryString = queryParams.toString() ? `?${queryParams.toString()}` : ''
    }

    return apiRequest<TaxFormTemplate[]>(`/api/taxforms/templates/${queryString}`)
}

/**
 * Get a specific tax form template by ID
 */
export async function getTaxFormTemplate(id: string): Promise<TaxFormTemplate> {
    // Check cache first
    const now = Date.now()
    const cached = templateCache.get(id)

    if (cached && now - cached.timestamp < CACHE_DURATION) {
        return cached.data
    }

    // Fetch from API
    const template = await apiRequest<TaxFormTemplate>(`/api/taxforms/templates/${id}/`)

    // Update cache
    templateCache.set(id, {
        data: template,
        timestamp: now,
    })

    return template
}

/**
 * Get templates grouped by tax year
 */
export async function getTaxFormTemplatesByYear(year?: number): Promise<TemplatesByYearResponse> {
    const queryString = year ? `?tax_year=${year}` : ''
    return apiRequest<TemplatesByYearResponse>(`/api/taxforms/templates/by_year/${queryString}`)
}

/**
 * Get all versions of a template
 */
export async function getTemplateVersions(templateId: string): Promise<TaxFormTemplateVersion[]> {
    return apiRequest<TaxFormTemplateVersion[]>(`/api/taxforms/templates/${templateId}/versions/`)
}

/**
 * Get a specific version of a template
 */
export async function getTemplateVersion(templateId: string, versionNumber: number): Promise<TaxFormTemplateVersion> {
    return apiRequest<TaxFormTemplateVersion>(
        `/api/taxforms/templates/${templateId}/version/?version_number=${versionNumber}`
    )
}

/**
 * Clear the template cache
 */
export function clearTemplateCache(): void {
    templateCache.clear()
}

/**
 * Check if template is cached
 */
export function isTemplateCached(id: string): boolean {
    const cached = templateCache.get(id)
    return cached ? Date.now() - cached.timestamp < CACHE_DURATION : false
}

/**
 * Get cached template (if available)
 */
export function getCachedTemplate(id: string): TaxFormTemplate | null {
    const cached = templateCache.get(id)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data
    }
    return null
}

/**
 * Force refresh a template (bypass cache)
 */
export async function refreshTemplate(id: string): Promise<TaxFormTemplate> {
    templateCache.delete(id)
    return getTaxFormTemplate(id)
}

/**
 * Batch load templates for multiple IDs
 */
export async function getTaxFormTemplatesBatch(ids: string[]): Promise<TaxFormTemplate[]> {
    const promises = ids.map((id) => getTaxFormTemplate(id))
    return Promise.all(promises)
}

/**
 * Get templates for current tax year
 */
export async function getCurrentYearTemplates(): Promise<TaxFormTemplate[]> {
    const currentYear = new Date().getFullYear()
    return getTaxFormTemplates({ tax_year: currentYear, is_active: true })
}

/**
 * Search templates by form number
 */
export async function searchTemplatesByFormNumber(formNumber: string): Promise<TaxFormTemplate[]> {
    const allTemplates = await getTaxFormTemplates({ is_active: true })
    return allTemplates.filter((template) => template.form_number.toLowerCase().includes(formNumber.toLowerCase()))
}

/**
 * Get template categories/jurisdictions
 */
export async function getTemplateJurisdictions(): Promise<string[]> {
    const allTemplates = await getTaxFormTemplates({ is_active: true })
    const jurisdictions = new Set(allTemplates.map((t) => t.jurisdiction).filter(Boolean))
    return Array.from(jurisdictions) as string[]
}

/**
 * Get available tax years
 */
export async function getAvailableTaxYears(): Promise<number[]> {
    const allTemplates = await getTaxFormTemplates({ is_active: true })
    const years = new Set(allTemplates.map((t) => t.tax_year))
    return Array.from(years).sort((a, b) => b - a) // Most recent first
}

// React Query keys for consistency
export const taxFormQueryKeys = {
    all: ['taxFormTemplates'] as const,
    lists: () => [...taxFormQueryKeys.all, 'list'] as const,
    list: (params?: TaxFormTemplateListParams) => [...taxFormQueryKeys.lists(), params] as const,
    details: () => [...taxFormQueryKeys.all, 'detail'] as const,
    detail: (id: string) => [...taxFormQueryKeys.details(), id] as const,
    versions: (templateId: string) => [...taxFormQueryKeys.detail(templateId), 'versions'] as const,
    version: (templateId: string, versionNumber: number) =>
        [...taxFormQueryKeys.versions(templateId), versionNumber] as const,
    byYear: (year?: number) => [...taxFormQueryKeys.all, 'byYear', year] as const,
    jurisdictions: () => [...taxFormQueryKeys.all, 'jurisdictions'] as const,
    years: () => [...taxFormQueryKeys.all, 'years'] as const,
}
