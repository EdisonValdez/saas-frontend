// Backend-aligned interfaces based on Django configuration

export interface TaxFormTemplateVersion {
    id: string
    template: string
    version_number: number
    created_by: string
    created_by_name: string
    field_mapping: Record<string, any>
    change_notes: string
    is_active: boolean
    created_at: string
}

export interface TaxFormTemplate {
    id: string
    form_number: string
    form_name: string
    tax_year: number
    template_file: string
    field_mapping: Record<string, any>
    is_active: boolean
    created_at: string
    updated_at: string
    current_version?: TaxFormTemplateVersion
    // Optional extended fields for compatibility
    jurisdiction?: string
    description?: string
    category?: string
}

export interface TaxFormTemplateListParams {
    tax_year?: number
    jurisdiction?: string
    is_active?: boolean
}

export interface TemplatesByYearResponse {
    [year: string]: TaxFormTemplate[]
}

// API response wrapper
export interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: string
    status: number
}

// Cache interface
export interface TemplateCache {
    data: TaxFormTemplate
    timestamp: number
}
