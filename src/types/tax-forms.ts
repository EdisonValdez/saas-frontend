export interface FormField {
    id: string
    name: string
    type: 'text' | 'number' | 'select' | 'checkbox' | 'date' | 'currency' | 'percentage'
    label: string
    required: boolean
    placeholder?: string
    description?: string
    validation?: {
        min?: number
        max?: number
        pattern?: string
        custom?: string
    }
    options?: Array<{
        value: string
        label: string
    }>
    defaultValue?: any
    calculation?: string
    dependencies?: string[]
}

export interface FormSection {
    id: string
    name: string
    title: string
    description?: string
    order: number
    fields: FormField[]
    conditionalLogic?: {
        showIf?: string
        hideIf?: string
    }
}

export interface TaxFormTemplate {
    id: string
    name: string
    form_number: string
    tax_year: number
    version: string
    description: string
    category: string
    complexity: 'simple' | 'intermediate' | 'complex'
    estimated_time: number
    filing_status?: string[]
    sections: FormSection[]
    metadata: {
        created_by: string
        created_at: string
        last_modified: string
        last_modified_by: string
        source_file_path?: string
        checksum?: string
        is_active: boolean
        filing_deadline?: string
        instructions_url?: string
        related_forms?: string[]
    }
    calculations?: {
        [key: string]: string
    }
    validations?: {
        [key: string]: string
    }
}

export interface TaxFormTemplateChange {
    id: string
    template_id: string
    version: string
    change_type: 'created' | 'updated' | 'deleted' | 'synced'
    changes: {
        field?: string
        old_value?: any
        new_value?: any
        action: 'added' | 'removed' | 'modified'
        description?: string
    }[]
    changed_by: string
    changed_at: string
    change_reason?: string
    diff?: string
}

export interface TaxFormTemplateListResponse {
    results: TaxFormTemplate[]
    count: number
    next?: string
    previous?: string
}

export interface TaxFormTemplateFilters {
    tax_year?: number
    category?: string
    complexity?: 'simple' | 'intermediate' | 'complex'
    filing_status?: string
    search?: string
    is_active?: boolean
    page?: number
    page_size?: number
}

export interface TemplateCreationData {
    name: string
    form_number: string
    tax_year: number
    description: string
    category: string
    complexity: 'simple' | 'intermediate' | 'complex'
    estimated_time: number
    sections: Omit<FormSection, 'id'>[]
    metadata?: Partial<TaxFormTemplate['metadata']>
}

export interface TemplateUpdateData extends Partial<TemplateCreationData> {
    change_reason?: string
}

export interface SyncFromFilesystemRequest {
    tax_year?: number
    force_update?: boolean
    dry_run?: boolean
}

export interface SyncFromFilesystemResponse {
    synced_templates: number
    created_templates: string[]
    updated_templates: string[]
    errors: Array<{
        file_path: string
        error: string
    }>
    dry_run?: boolean
}

export interface CreateVersionRequest {
    change_reason: string
    changes?: Partial<TaxFormTemplate>
}

export interface CreateVersionResponse {
    new_version: string
    template: TaxFormTemplate
}

// Computed properties for templates
export interface EnhancedTaxFormTemplate extends TaxFormTemplate {
    total_fields: number
    completion_percentage?: number
    validation_errors?: string[]
    missing_required_fields?: string[]
    has_calculations: boolean
    has_dependencies: boolean
}

// Form generation related types
export interface FormGenerationRequest {
    template_id: string
    client_data: Record<string, any>
    workspace_id: string
    form_name?: string
    save_as_draft?: boolean
}

export interface FormGenerationResponse {
    form_id: string
    template_id: string
    generated_form: {
        sections: Array<{
            id: string
            name: string
            fields: Array<{
                id: string
                value: any
                calculated_value?: any
                validation_status: 'valid' | 'invalid' | 'warning'
                validation_message?: string
            }>
        }>
    }
    completion_status: {
        total_fields: number
        completed_fields: number
        required_missing: number
        warnings: number
        errors: number
    }
    calculations_performed: boolean
    validation_summary: {
        passed: boolean
        errors: string[]
        warnings: string[]
    }
}

// Client-side cache interface
export interface TemplateCache {
    templates: Map<string, TaxFormTemplate>
    lastFetched: Map<string, number>
    filters: Map<string, TaxFormTemplateListResponse>
    ttl: number // Time to live in milliseconds
}

// Error types
export interface TaxFormTemplateError {
    code: string
    message: string
    field?: string
    details?: Record<string, any>
}
