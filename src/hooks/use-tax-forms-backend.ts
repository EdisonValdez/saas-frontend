'use client'

import { useQuery } from '@tanstack/react-query'
import {
    getTaxFormTemplates,
    getTaxFormTemplate,
    getTaxFormTemplatesByYear,
    getTemplateVersions,
    getTemplateVersion,
    getCurrentYearTemplates,
    getAvailableTaxYears,
    getTemplateJurisdictions,
    taxFormQueryKeys
} from '@/lib/api/tax-forms-backend'
import type {
    TaxFormTemplate,
    TaxFormTemplateVersion,
    TaxFormTemplateListParams,
    TemplatesByYearResponse
} from '@/types/tax-forms-backend'

// Hook for fetching all templates with optional parameters
export function useTaxFormTemplates(params?: TaxFormTemplateListParams) {
    return useQuery({
        queryKey: taxFormQueryKeys.list(params),
        queryFn: () => getTaxFormTemplates(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: (failureCount, error: any) => {
            if (error?.status === 401 || error?.status === 403) {
                return false
            }
            return failureCount < 3
        },
    })
}

// Hook for fetching a single template
export function useTaxFormTemplate(templateId: string, enabled = true) {
    return useQuery({
        queryKey: taxFormQueryKeys.detail(templateId),
        queryFn: () => getTaxFormTemplate(templateId),
        enabled: enabled && !!templateId,
        staleTime: 15 * 60 * 1000, // 15 minutes for individual templates (matches cache)
    })
}

// Hook for fetching templates grouped by year
export function useTaxFormTemplatesByYear(year?: number) {
    return useQuery({
        queryKey: taxFormQueryKeys.byYear(year),
        queryFn: () => getTaxFormTemplatesByYear(year),
        staleTime: 10 * 60 * 1000, // 10 minutes
    })
}

// Hook for fetching template versions
export function useTemplateVersions(templateId: string, enabled = true) {
    return useQuery({
        queryKey: taxFormQueryKeys.versions(templateId),
        queryFn: () => getTemplateVersions(templateId),
        enabled: enabled && !!templateId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })
}

// Hook for fetching a specific template version
export function useTemplateVersion(templateId: string, versionNumber: number, enabled = true) {
    return useQuery({
        queryKey: taxFormQueryKeys.version(templateId, versionNumber),
        queryFn: () => getTemplateVersion(templateId, versionNumber),
        enabled: enabled && !!templateId && !!versionNumber,
        staleTime: 15 * 60 * 1000, // 15 minutes
    })
}

// Hook for fetching current year templates
export function useCurrentYearTemplates() {
    const currentYear = new Date().getFullYear()
    return useQuery({
        queryKey: taxFormQueryKeys.list({ tax_year: currentYear, is_active: true }),
        queryFn: () => getCurrentYearTemplates(),
        staleTime: 10 * 60 * 1000, // 10 minutes
    })
}

// Hook for fetching available tax years
export function useAvailableTaxYears() {
    return useQuery({
        queryKey: taxFormQueryKeys.years(),
        queryFn: () => getAvailableTaxYears(),
        staleTime: 30 * 60 * 1000, // 30 minutes (years don't change often)
    })
}

// Hook for fetching available jurisdictions
export function useTemplateJurisdictions() {
    return useQuery({
        queryKey: taxFormQueryKeys.jurisdictions(),
        queryFn: () => getTemplateJurisdictions(),
        staleTime: 30 * 60 * 1000, // 30 minutes
    })
}

// Hook for templates filtered by jurisdiction
export function useTemplatesByJurisdiction(jurisdiction: string, enabled = true) {
    return useQuery({
        queryKey: taxFormQueryKeys.list({ jurisdiction, is_active: true }),
        queryFn: () => getTaxFormTemplates({ jurisdiction, is_active: true }),
        enabled: enabled && !!jurisdiction,
        staleTime: 10 * 60 * 1000,
    })
}

// Custom hook for template selector functionality (matches your example component needs)
export function useTaxFormSelector(selectedYear?: number) {
    const currentYear = new Date().getFullYear()
    const targetYear = selectedYear || currentYear
    
    const { 
        data: templatesByYear, 
        isLoading, 
        error 
    } = useTaxFormTemplatesByYear()
    
    const years = templatesByYear ? Object.keys(templatesByYear).sort().reverse() : []
    const activeYear = years.includes(targetYear.toString()) ? targetYear.toString() : years[0] || currentYear.toString()
    const activeTemplates = templatesByYear?.[activeYear] || []
    
    return {
        templatesByYear,
        years,
        activeYear,
        activeTemplates,
        isLoading,
        error,
        hasTemplates: activeTemplates.length > 0
    }
}

// Hook for enhanced template data with computed properties
export function useEnhancedTemplate(templateId: string, enabled = true) {
    const templateQuery = useTaxFormTemplate(templateId, enabled)
    const versionsQuery = useTemplateVersions(templateId, enabled && !!templateQuery.data)
    
    const enhancedData = templateQuery.data ? {
        ...templateQuery.data,
        totalVersions: versionsQuery.data?.length || 0,
        hasMultipleVersions: (versionsQuery.data?.length || 0) > 1,
        latestVersion: versionsQuery.data?.[0], // Assuming versions are sorted by latest first
        isOutdated: templateQuery.data.current_version?.version_number !== versionsQuery.data?.[0]?.version_number
    } : undefined
    
    return {
        ...templateQuery,
        data: enhancedData,
        versions: versionsQuery.data,
        isLoadingVersions: versionsQuery.isLoading,
        versionsError: versionsQuery.error
    }
}
