'use client'

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { 
    taxFormTemplateApi, 
    taxFormTemplateQueryKeys 
} from '@/lib/api/tax-form-templates'
import type {
    TaxFormTemplate,
    TaxFormTemplateChange,
    TaxFormTemplateFilters,
    TemplateCreationData,
    TemplateUpdateData,
    SyncFromFilesystemRequest,
    CreateVersionRequest,
    FormGenerationRequest,
    EnhancedTaxFormTemplate
} from '@/types/tax-forms'
import { toast } from 'sonner'

// Hook for fetching paginated templates
export function useTaxFormTemplates(filters?: TaxFormTemplateFilters) {
    return useQuery({
        queryKey: taxFormTemplateQueryKeys.list(filters),
        queryFn: () => taxFormTemplateApi.getTemplates(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
        select: (response) => response.success ? response.data : undefined,
        retry: (failureCount, error: any) => {
            if (error?.status === 401 || error?.status === 403) {
                return false
            }
            return failureCount < 3
        },
    })
}

// Hook for infinite scroll/pagination
export function useInfiniteTaxFormTemplates(filters?: Omit<TaxFormTemplateFilters, 'page'>) {
    return useInfiniteQuery({
        queryKey: taxFormTemplateQueryKeys.list(filters),
        queryFn: ({ pageParam = 1 }) => 
            taxFormTemplateApi.getTemplates({ ...filters, page: pageParam }),
        getNextPageParam: (lastPage) => {
            if (!lastPage.success || !lastPage.data?.next) return undefined
            const url = new URL(lastPage.data.next)
            return parseInt(url.searchParams.get('page') || '1')
        },
        select: (data) => ({
            pages: data.pages.map(page => page.success ? page.data : undefined).filter(Boolean),
            pageParams: data.pageParams,
        }),
        staleTime: 5 * 60 * 1000,
    })
}

// Hook for fetching a single template
export function useTaxFormTemplate(templateId: string, enabled = true) {
    return useQuery({
        queryKey: taxFormTemplateQueryKeys.detail(templateId),
        queryFn: () => taxFormTemplateApi.getTemplate(templateId),
        enabled: enabled && !!templateId,
        staleTime: 10 * 60 * 1000, // 10 minutes for individual templates
        select: (response) => response.success ? response.data : undefined,
    })
}

// Hook for fetching enhanced template with computed properties
export function useEnhancedTaxFormTemplate(templateId: string, enabled = true) {
    return useQuery({
        queryKey: taxFormTemplateQueryKeys.enhanced(templateId),
        queryFn: () => taxFormTemplateApi.getEnhancedTemplate(templateId),
        enabled: enabled && !!templateId,
        staleTime: 10 * 60 * 1000,
        select: (response) => response.success ? response.data : undefined,
    })
}

// Hook for fetching template changes/history
export function useTaxFormTemplateChanges(templateId: string, enabled = true) {
    return useQuery({
        queryKey: taxFormTemplateQueryKeys.changes(templateId),
        queryFn: () => taxFormTemplateApi.getTemplateChanges(templateId),
        enabled: enabled && !!templateId,
        staleTime: 2 * 60 * 1000, // 2 minutes for changes
        select: (response) => response.success ? response.data : undefined,
    })
}

// Hook for searching templates
export function useSearchTaxFormTemplates(query: string, filters?: Omit<TaxFormTemplateFilters, 'search'>) {
    return useQuery({
        queryKey: taxFormTemplateQueryKeys.search(query),
        queryFn: () => taxFormTemplateApi.searchTemplates(query, filters),
        enabled: !!query && query.length >= 2,
        staleTime: 1 * 60 * 1000, // 1 minute for search results
        select: (response) => response.success ? response.data : undefined,
    })
}

// Hook for fetching templates by year
export function useTaxFormTemplatesByYear(taxYear: number, enabled = true) {
    return useQuery({
        queryKey: taxFormTemplateQueryKeys.year(taxYear),
        queryFn: () => taxFormTemplateApi.getTemplatesByYear(taxYear),
        enabled: enabled && !!taxYear,
        staleTime: 10 * 60 * 1000,
        select: (response) => response.success ? response.data : undefined,
    })
}

// Hook for fetching templates by category
export function useTaxFormTemplatesByCategory(category: string, enabled = true) {
    return useQuery({
        queryKey: taxFormTemplateQueryKeys.category(category),
        queryFn: () => taxFormTemplateApi.getTemplatesByCategory(category),
        enabled: enabled && !!category,
        staleTime: 5 * 60 * 1000,
        select: (response) => response.success ? response.data : undefined,
    })
}

// Mutation hooks
export function useCreateTaxFormTemplate() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (templateData: TemplateCreationData) => 
            taxFormTemplateApi.createTemplate(templateData),
        onSuccess: (response) => {
            if (response.success) {
                // Invalidate template lists
                queryClient.invalidateQueries({ 
                    queryKey: taxFormTemplateQueryKeys.lists() 
                })
                toast.success('Template created successfully')
            } else {
                toast.error(response.error || 'Failed to create template')
            }
        },
        onError: (error) => {
            toast.error('Failed to create template')
            console.error('Create template error:', error)
        },
    })
}

export function useUpdateTaxFormTemplate() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ templateId, updateData }: { templateId: string; updateData: TemplateUpdateData }) =>
            taxFormTemplateApi.updateTemplate(templateId, updateData),
        onSuccess: (response, variables) => {
            if (response.success) {
                // Update the specific template in cache
                queryClient.setQueryData(
                    taxFormTemplateQueryKeys.detail(variables.templateId),
                    { ...response, success: true }
                )
                // Invalidate lists and enhanced data
                queryClient.invalidateQueries({ 
                    queryKey: taxFormTemplateQueryKeys.lists() 
                })
                queryClient.invalidateQueries({ 
                    queryKey: taxFormTemplateQueryKeys.enhanced(variables.templateId) 
                })
                toast.success('Template updated successfully')
            } else {
                toast.error(response.error || 'Failed to update template')
            }
        },
        onError: (error) => {
            toast.error('Failed to update template')
            console.error('Update template error:', error)
        },
    })
}

export function useDeleteTaxFormTemplate() {
    const queryClient = useQueryClient()
    const router = useRouter()

    return useMutation({
        mutationFn: (templateId: string) => taxFormTemplateApi.deleteTemplate(templateId),
        onSuccess: (response, templateId) => {
            if (response.success) {
                // Remove from cache
                queryClient.removeQueries({ 
                    queryKey: taxFormTemplateQueryKeys.detail(templateId) 
                })
                // Invalidate lists
                queryClient.invalidateQueries({ 
                    queryKey: taxFormTemplateQueryKeys.lists() 
                })
                toast.success('Template deleted successfully')
                router.push('/dashboard/tax-forms/templates')
            } else {
                toast.error(response.error || 'Failed to delete template')
            }
        },
        onError: (error) => {
            toast.error('Failed to delete template')
            console.error('Delete template error:', error)
        },
    })
}

export function useSyncFromFilesystem() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (request: SyncFromFilesystemRequest) =>
            taxFormTemplateApi.syncFromFilesystem(request),
        onSuccess: (response) => {
            if (response.success && response.data) {
                // Clear all template cache after sync
                queryClient.invalidateQueries({ 
                    queryKey: taxFormTemplateQueryKeys.all 
                })
                
                const { synced_templates, created_templates, updated_templates, errors } = response.data
                
                if (synced_templates > 0) {
                    toast.success(
                        `Sync completed: ${created_templates.length} created, ${updated_templates.length} updated`
                    )
                }
                
                if (errors.length > 0) {
                    toast.warning(`Sync completed with ${errors.length} errors`)
                }
            } else {
                toast.error(response.error || 'Sync failed')
            }
        },
        onError: (error) => {
            toast.error('Failed to sync templates from filesystem')
            console.error('Sync error:', error)
        },
    })
}

export function useCreateTemplateVersion() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ templateId, request }: { templateId: string; request: CreateVersionRequest }) =>
            taxFormTemplateApi.createNewVersion(templateId, request),
        onSuccess: (response, variables) => {
            if (response.success && response.data) {
                // Update template cache with new version
                queryClient.setQueryData(
                    taxFormTemplateQueryKeys.detail(variables.templateId),
                    { data: response.data.template, success: true, status: 200 }
                )
                // Invalidate changes to refresh history
                queryClient.invalidateQueries({ 
                    queryKey: taxFormTemplateQueryKeys.changes(variables.templateId) 
                })
                // Invalidate lists
                queryClient.invalidateQueries({ 
                    queryKey: taxFormTemplateQueryKeys.lists() 
                })
                toast.success(`New version ${response.data.new_version} created`)
            } else {
                toast.error(response.error || 'Failed to create new version')
            }
        },
        onError: (error) => {
            toast.error('Failed to create new version')
            console.error('Create version error:', error)
        },
    })
}

export function useGenerateForm() {
    return useMutation({
        mutationFn: (request: FormGenerationRequest) =>
            taxFormTemplateApi.generateForm(request),
        onSuccess: (response) => {
            if (response.success) {
                toast.success('Form generated successfully')
            } else {
                toast.error(response.error || 'Failed to generate form')
            }
        },
        onError: (error) => {
            toast.error('Failed to generate form')
            console.error('Generate form error:', error)
        },
    })
}

// Utility hooks
export function useTaxFormTemplateCache() {
    const queryClient = useQueryClient()

    const clearCache = () => {
        queryClient.invalidateQueries({ 
            queryKey: taxFormTemplateQueryKeys.all 
        })
        taxFormTemplateApi.clearCache()
    }

    const invalidateTemplate = (templateId: string) => {
        queryClient.invalidateQueries({ 
            queryKey: taxFormTemplateQueryKeys.detail(templateId) 
        })
        taxFormTemplateApi.invalidateTemplate(templateId)
    }

    const prefetchTemplate = (templateId: string) => {
        return queryClient.prefetchQuery({
            queryKey: taxFormTemplateQueryKeys.detail(templateId),
            queryFn: () => taxFormTemplateApi.getTemplate(templateId),
            staleTime: 10 * 60 * 1000,
        })
    }

    return {
        clearCache,
        invalidateTemplate,
        prefetchTemplate,
    }
}

// Optimistic updates helper
export function useOptimisticTemplateUpdate() {
    const queryClient = useQueryClient()

    const updateTemplate = (templateId: string, updater: (old: TaxFormTemplate) => TaxFormTemplate) => {
        queryClient.setQueryData(
            taxFormTemplateQueryKeys.detail(templateId),
            (old: any) => {
                if (!old?.success || !old?.data) return old
                return {
                    ...old,
                    data: updater(old.data)
                }
            }
        )
    }

    return { updateTemplate }
}

// Template validation hook
export function useTaxFormTemplateValidation() {
    const validateTemplate = (template: TaxFormTemplate) => {
        return taxFormTemplateApi.validateTemplate(template)
    }

    const validateTemplateSection = (section: TaxFormTemplate['sections'][0]) => {
        const errors: string[] = []
        
        if (!section.name?.trim()) {
            errors.push('Section name is required')
        }
        
        if (section.fields.length === 0) {
            errors.push('At least one field is required')
        }
        
        section.fields.forEach((field, index) => {
            if (!field.name?.trim()) {
                errors.push(`Field ${index + 1}: Name is required`)
            }
            if (!field.type) {
                errors.push(`Field "${field.name}": Type is required`)
            }
        })
        
        return errors
    }

    return {
        validateTemplate,
        validateTemplateSection,
    }
}
