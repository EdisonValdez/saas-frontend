'use client'

import React, { useState, useEffect } from 'react'
import { getTaxFormTemplatesByYear } from '@/lib/api/tax-forms-backend'
import type { TaxFormTemplate, TemplatesByYearResponse } from '@/types/tax-forms-backend'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, FileText, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaxFormSelectorProps {
    onSelectTemplate: (template: TaxFormTemplate) => void
    selectedYear?: number
    className?: string
}

export function TaxFormSelector({ onSelectTemplate, selectedYear, className }: TaxFormSelectorProps) {
    const [templates, setTemplates] = useState<TemplatesByYearResponse>({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeYear, setActiveYear] = useState<string>(
        selectedYear ? selectedYear.toString() : new Date().getFullYear().toString()
    )

    useEffect(() => {
        async function loadTemplates() {
            try {
                setLoading(true)
                const data = await getTaxFormTemplatesByYear()
                setTemplates(data)

                // If no active year is set or it's not in the results, use the most recent
                if (!activeYear || !data[activeYear]) {
                    const years = Object.keys(data).sort().reverse()
                    if (years.length > 0) {
                        setActiveYear(years[0])
                    }
                }

                setError(null)
            } catch (err) {
                setError('Failed to load templates')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        loadTemplates()
    }, [activeYear])

    if (loading) {
        return (
            <div className={cn('flex items-center justify-center p-8', className)}>
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading templates...</span>
            </div>
        )
    }

    if (error) {
        return (
            <div className={cn('flex items-center justify-center p-8', className)}>
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
                    <div className="text-red-600 font-medium">{error}</div>
                    <Button variant="outline" onClick={() => window.location.reload()} className="mt-2">
                        Retry
                    </Button>
                </div>
            </div>
        )
    }

    const years = Object.keys(templates).sort().reverse()
    const activeTemplates = templates[activeYear] || []

    return (
        <div className={cn('tax-form-selector space-y-6', className)}>
            {/* Year Tabs */}
            <div className="year-tabs">
                <div className="flex flex-wrap gap-2">
                    {years.map((year) => (
                        <Button
                            key={year}
                            variant={year === activeYear ? 'default' : 'outline'}
                            onClick={() => setActiveYear(year)}
                            className="min-w-[80px]"
                        >
                            {year}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Templates Grid */}
            <div className="templates-grid">
                {activeTemplates.length === 0 ? (
                    <div className="no-templates text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <div className="text-gray-600 text-lg mb-2">No templates available for {activeYear}</div>
                        <div className="text-gray-500 text-sm">Templates for this tax year haven't been loaded yet</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeTemplates.map((template) => (
                            <TemplateCard key={template.id} template={template} onSelect={onSelectTemplate} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

interface TemplateCardProps {
    template: TaxFormTemplate
    onSelect: (template: TaxFormTemplate) => void
}

function TemplateCard({ template, onSelect }: TemplateCardProps) {
    return (
        <Card
            className="template-card cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onSelect(template)}
        >
            <CardContent className="p-4">
                <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-gray-900 truncate">{template.form_name}</h3>
                                <div className="form-number text-sm text-gray-600">{template.form_number}</div>
                            </div>
                        </div>
                        {!template.is_active && (
                            <Badge variant="secondary" className="text-xs">
                                Inactive
                            </Badge>
                        )}
                    </div>

                    {/* Details */}
                    <div className="space-y-2">
                        <div className="tax-year text-sm text-gray-600">Tax Year: {template.tax_year}</div>

                        {template.jurisdiction && (
                            <div className="text-sm text-gray-600">Jurisdiction: {template.jurisdiction}</div>
                        )}

                        {template.description && (
                            <div className="text-sm text-gray-600 line-clamp-2">{template.description}</div>
                        )}

                        {template.current_version && (
                            <div className="version flex items-center justify-between text-xs">
                                <span className="text-gray-500">
                                    Version: {template.current_version.version_number}
                                </span>
                                {template.current_version.created_by_name && (
                                    <span className="text-gray-500">by {template.current_version.created_by_name}</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="pt-2 border-t border-gray-100">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Updated: {new Date(template.updated_at).toLocaleDateString()}</span>
                            {template.category && (
                                <Badge variant="outline" className="text-xs">
                                    {template.category}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

// Export both the main component and the card for flexibility
export { TemplateCard }
