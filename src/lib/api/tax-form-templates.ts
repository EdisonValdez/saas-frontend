import { enhancedApiClient, type ApiResponse } from '@/lib/api-client-enhanced'
import type {
    TaxFormTemplate,
    TaxFormTemplateChange,
    TaxFormTemplateListResponse,
    TaxFormTemplateFilters,
    TemplateCreationData,
    TemplateUpdateData,
    SyncFromFilesystemRequest,
    SyncFromFilesystemResponse,
    CreateVersionRequest,
    CreateVersionResponse,
    FormGenerationRequest,
    FormGenerationResponse,
    EnhancedTaxFormTemplate,
    TemplateCache
} from '@/types/tax-forms'

class TaxFormTemplateApiClient {
    private cache: TemplateCache = {
        templates: new Map(),
        lastFetched: new Map(),
        filters: new Map(),
        ttl: 5 * 60 * 1000, // 5 minutes
    }

    private baseEndpoint = '/api/tax-forms/templates'

    // Template CRUD operations
    async getTemplates(filters?: TaxFormTemplateFilters): Promise<ApiResponse<TaxFormTemplateListResponse>> {
        const cacheKey = JSON.stringify(filters || {})
        const cached = this.cache.filters.get(cacheKey)
        const lastFetched = this.cache.lastFetched.get(cacheKey) || 0
        
        // Return cached data if still valid
        if (cached && Date.now() - lastFetched < this.cache.ttl) {
            return {
                data: cached,
                status: 200,
                success: true,
            }
        }

        const queryParams = new URLSearchParams()
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, value.toString())
                }
            })
        }

        const endpoint = `${this.baseEndpoint}/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
        const response = await enhancedApiClient.request<TaxFormTemplateListResponse>(endpoint)

        // Cache successful responses
        if (response.success && response.data) {
            this.cache.filters.set(cacheKey, response.data)
            this.cache.lastFetched.set(cacheKey, Date.now())
            
            // Cache individual templates
            response.data.results.forEach(template => {
                this.cache.templates.set(template.id, template)
            })
        }

        return response
    }

    async getTemplate(templateId: string, useCache = true): Promise<ApiResponse<TaxFormTemplate>> {
        // Check cache first
        if (useCache) {
            const cached = this.cache.templates.get(templateId)
            const lastFetched = this.cache.lastFetched.get(templateId) || 0
            
            if (cached && Date.now() - lastFetched < this.cache.ttl) {
                return {
                    data: cached,
                    status: 200,
                    success: true,
                }
            }
        }

        const response = await enhancedApiClient.request<TaxFormTemplate>(`${this.baseEndpoint}/${templateId}/`)

        // Cache successful response
        if (response.success && response.data) {
            this.cache.templates.set(templateId, response.data)
            this.cache.lastFetched.set(templateId, Date.now())
        }

        return response
    }

    async createTemplate(templateData: TemplateCreationData): Promise<ApiResponse<TaxFormTemplate>> {
        const response = await enhancedApiClient.request<TaxFormTemplate>(this.baseEndpoint, {
            method: 'POST',
            body: JSON.stringify(templateData),
        })

        // Invalidate cache on successful creation
        if (response.success) {
            this.clearCache()
        }

        return response
    }

    async updateTemplate(templateId: string, updateData: TemplateUpdateData): Promise<ApiResponse<TaxFormTemplate>> {
        const response = await enhancedApiClient.request<TaxFormTemplate>(`${this.baseEndpoint}/${templateId}/`, {
            method: 'PATCH',
            body: JSON.stringify(updateData),
        })

        // Update cache and invalidate filters
        if (response.success && response.data) {
            this.cache.templates.set(templateId, response.data)
            this.cache.lastFetched.set(templateId, Date.now())
            this.cache.filters.clear() // Clear filter cache as lists might have changed
        }

        return response
    }

    async deleteTemplate(templateId: string): Promise<ApiResponse<void>> {
        const response = await enhancedApiClient.request<void>(`${this.baseEndpoint}/${templateId}/`, {
            method: 'DELETE',
        })

        // Remove from cache on successful deletion
        if (response.success) {
            this.cache.templates.delete(templateId)
            this.cache.lastFetched.delete(templateId)
            this.cache.filters.clear()
        }

        return response
    }

    // Template synchronization
    async syncFromFilesystem(request: SyncFromFilesystemRequest): Promise<ApiResponse<SyncFromFilesystemResponse>> {
        const response = await enhancedApiClient.request<SyncFromFilesystemResponse>(
            `${this.baseEndpoint}/sync_from_filesystem/`,
            {
                method: 'POST',
                body: JSON.stringify(request),
            }
        )

        // Clear cache after sync as templates may have changed
        if (response.success) {
            this.clearCache()
        }

        return response
    }

    // Version management
    async getTemplateChanges(templateId: string): Promise<ApiResponse<TaxFormTemplateChange[]>> {
        return enhancedApiClient.request<TaxFormTemplateChange[]>(`${this.baseEndpoint}/${templateId}/changes/`)
    }

    async createNewVersion(templateId: string, request: CreateVersionRequest): Promise<ApiResponse<CreateVersionResponse>> {
        const response = await enhancedApiClient.request<CreateVersionResponse>(
            `${this.baseEndpoint}/${templateId}/create_new_version/`,
            {
                method: 'POST',
                body: JSON.stringify(request),
            }
        )

        // Update cache with new version
        if (response.success && response.data) {
            this.cache.templates.set(templateId, response.data.template)
            this.cache.lastFetched.set(templateId, Date.now())
            this.cache.filters.clear()
        }

        return response
    }

    // Form generation
    async generateForm(request: FormGenerationRequest): Promise<ApiResponse<FormGenerationResponse>> {
        return enhancedApiClient.request<FormGenerationResponse>('/api/tax-forms/generate/', {
            method: 'POST',
            body: JSON.stringify(request),
        })
    }

    // Enhanced template operations
    async getEnhancedTemplate(templateId: string): Promise<ApiResponse<EnhancedTaxFormTemplate>> {
        const response = await this.getTemplate(templateId)
        
        if (!response.success || !response.data) {
            return response as ApiResponse<EnhancedTaxFormTemplate>
        }

        const template = response.data
        const enhanced: EnhancedTaxFormTemplate = {
            ...template,
            total_fields: this.calculateTotalFields(template),
            has_calculations: this.hasCalculations(template),
            has_dependencies: this.hasDependencies(template),
        }

        return {
            ...response,
            data: enhanced,
        }
    }

    // Bulk operations
    async getTemplatesByYear(taxYear: number): Promise<ApiResponse<TaxFormTemplate[]>> {
        const response = await this.getTemplates({ tax_year: taxYear })
        
        if (response.success && response.data) {
            return {
                ...response,
                data: response.data.results,
            }
        }

        return response as ApiResponse<TaxFormTemplate[]>
    }

    async getTemplatesByCategory(category: string): Promise<ApiResponse<TaxFormTemplate[]>> {
        const response = await this.getTemplates({ category })
        
        if (response.success && response.data) {
            return {
                ...response,
                data: response.data.results,
            }
        }

        return response as ApiResponse<TaxFormTemplate[]>
    }

    // Search operations
    async searchTemplates(query: string, filters?: Omit<TaxFormTemplateFilters, 'search'>): Promise<ApiResponse<TaxFormTemplate[]>> {
        const response = await this.getTemplates({ ...filters, search: query })
        
        if (response.success && response.data) {
            return {
                ...response,
                data: response.data.results,
            }
        }

        return response as ApiResponse<TaxFormTemplate[]>
    }

    // Cache management
    clearCache(): void {
        this.cache.templates.clear()
        this.cache.lastFetched.clear()
        this.cache.filters.clear()
    }

    invalidateTemplate(templateId: string): void {
        this.cache.templates.delete(templateId)
        this.cache.lastFetched.delete(templateId)
        this.cache.filters.clear()
    }

    setCacheTtl(ttl: number): void {
        this.cache.ttl = ttl
    }

    // Helper methods
    private calculateTotalFields(template: TaxFormTemplate): number {
        return template.sections.reduce((total, section) => total + section.fields.length, 0)
    }

    private hasCalculations(template: TaxFormTemplate): boolean {
        return template.sections.some(section =>
            section.fields.some(field => field.calculation)
        ) || (template.calculations && Object.keys(template.calculations).length > 0)
    }

    private hasDependencies(template: TaxFormTemplate): boolean {
        return template.sections.some(section =>
            section.fields.some(field => field.dependencies && field.dependencies.length > 0) ||
            section.conditionalLogic
        )
    }

    // Validation helpers
    validateTemplate(template: TaxFormTemplate): string[] {
        const errors: string[] = []

        if (!template.name || template.name.trim().length === 0) {
            errors.push('Template name is required')
        }

        if (!template.form_number || template.form_number.trim().length === 0) {
            errors.push('Form number is required')
        }

        if (!template.tax_year || template.tax_year < 2000 || template.tax_year > new Date().getFullYear() + 1) {
            errors.push('Valid tax year is required')
        }

        if (template.sections.length === 0) {
            errors.push('At least one section is required')
        }

        template.sections.forEach((section, sectionIndex) => {
            if (!section.name || section.name.trim().length === 0) {
                errors.push(`Section ${sectionIndex + 1}: Name is required`)
            }

            if (section.fields.length === 0) {
                errors.push(`Section "${section.name}": At least one field is required`)
            }

            section.fields.forEach((field, fieldIndex) => {
                if (!field.name || field.name.trim().length === 0) {
                    errors.push(`Section "${section.name}", Field ${fieldIndex + 1}: Name is required`)
                }

                if (!field.type) {
                    errors.push(`Section "${section.name}", Field "${field.name}": Type is required`)
                }
            })
        })

        return errors
    }

    // Export/Import helpers
    exportTemplate(template: TaxFormTemplate): string {
        return JSON.stringify(template, null, 2)
    }

    importTemplate(jsonData: string): TaxFormTemplate | null {
        try {
            const template = JSON.parse(jsonData) as TaxFormTemplate
            const errors = this.validateTemplate(template)
            
            if (errors.length > 0) {
                console.error('Template validation errors:', errors)
                return null
            }

            return template
        } catch (error) {
            console.error('Failed to parse template JSON:', error)
            return null
        }
    }
}

// Export singleton instance
export const taxFormTemplateApi = new TaxFormTemplateApiClient()

// Export query keys for React Query
export const taxFormTemplateQueryKeys = {
    all: ['taxFormTemplates'] as const,
    lists: () => [...taxFormTemplateQueryKeys.all, 'list'] as const,
    list: (filters?: TaxFormTemplateFilters) => [...taxFormTemplateQueryKeys.lists(), filters] as const,
    details: () => [...taxFormTemplateQueryKeys.all, 'detail'] as const,
    detail: (id: string) => [...taxFormTemplateQueryKeys.details(), id] as const,
    changes: (id: string) => [...taxFormTemplateQueryKeys.detail(id), 'changes'] as const,
    enhanced: (id: string) => [...taxFormTemplateQueryKeys.detail(id), 'enhanced'] as const,
    search: (query: string) => [...taxFormTemplateQueryKeys.all, 'search', query] as const,
    year: (year: number) => [...taxFormTemplateQueryKeys.lists(), 'year', year] as const,
    category: (category: string) => [...taxFormTemplateQueryKeys.lists(), 'category', category] as const,
}
