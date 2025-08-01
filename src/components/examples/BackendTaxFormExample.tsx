'use client'

import React, { useState } from 'react'
import { TaxFormSelector } from '@/components/forms/TaxFormSelector'
import FormTemplateSelection from '@/components/forms/form-template-selection'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { TaxFormTemplate as BackendTemplate } from '@/types/tax-forms-backend'
import type { TaxFormTemplate as OriginalTemplate } from '@/types/tax-forms'

export default function BackendTaxFormExample({ workspaceId }: { workspaceId: string }) {
    const [selectedBackendTemplate, setSelectedBackendTemplate] = useState<BackendTemplate | null>(null)
    const [selectedOriginalTemplate, setSelectedOriginalTemplate] = useState<OriginalTemplate | null>(null)

    const handleBackendTemplateSelect = (template: BackendTemplate) => {
        setSelectedBackendTemplate(template)
        console.log('Selected backend template:', template)
    }

    const handleOriginalTemplateSelect = (template: OriginalTemplate) => {
        setSelectedOriginalTemplate(template)
        console.log('Selected original template:', template)
    }

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Tax Form Template Integration Example</h1>
                <p className="text-gray-600">
                    Demonstrates both backend-aligned and original API integration approaches
                </p>
            </div>

            <Tabs defaultValue="backend" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="backend">Backend-Aligned API</TabsTrigger>
                    <TabsTrigger value="original">Original API (with Backend Support)</TabsTrigger>
                </TabsList>

                {/* Backend-aligned API example */}
                <TabsContent value="backend" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Backend-Aligned Tax Form Selector</CardTitle>
                            <CardDescription>
                                Uses the backend-aligned API that matches your Django configuration exactly
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TaxFormSelector onSelectTemplate={handleBackendTemplateSelect} selectedYear={2024} />
                        </CardContent>
                    </Card>

                    {selectedBackendTemplate && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Selected Backend Template</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-semibold mb-2">Template Information</h4>
                                        <div className="space-y-2 text-sm">
                                            <div>
                                                <strong>Form Name:</strong> {selectedBackendTemplate.form_name}
                                            </div>
                                            <div>
                                                <strong>Form Number:</strong> {selectedBackendTemplate.form_number}
                                            </div>
                                            <div>
                                                <strong>Tax Year:</strong> {selectedBackendTemplate.tax_year}
                                            </div>
                                            <div>
                                                <strong>Template File:</strong> {selectedBackendTemplate.template_file}
                                            </div>
                                            <div>
                                                <strong>Status:</strong>
                                                <Badge
                                                    className={
                                                        selectedBackendTemplate.is_active
                                                            ? 'ml-2 bg-green-100 text-green-800'
                                                            : 'ml-2 bg-red-100 text-red-800'
                                                    }
                                                >
                                                    {selectedBackendTemplate.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedBackendTemplate.current_version && (
                                        <div>
                                            <h4 className="font-semibold mb-2">Current Version</h4>
                                            <div className="space-y-2 text-sm">
                                                <div>
                                                    <strong>Version:</strong>{' '}
                                                    {selectedBackendTemplate.current_version.version_number}
                                                </div>
                                                <div>
                                                    <strong>Created By:</strong>{' '}
                                                    {selectedBackendTemplate.current_version.created_by_name}
                                                </div>
                                                <div>
                                                    <strong>Created:</strong>{' '}
                                                    {new Date(
                                                        selectedBackendTemplate.current_version.created_at
                                                    ).toLocaleDateString()}
                                                </div>
                                                <div>
                                                    <strong>Change Notes:</strong>{' '}
                                                    {selectedBackendTemplate.current_version.change_notes}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {selectedBackendTemplate.field_mapping && (
                                    <div className="mt-4">
                                        <h4 className="font-semibold mb-2">Field Mapping</h4>
                                        <div className="bg-gray-50 p-3 rounded text-xs">
                                            <pre>{JSON.stringify(selectedBackendTemplate.field_mapping, null, 2)}</pre>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Original API with backend support */}
                <TabsContent value="original" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Enhanced Template Selection</CardTitle>
                            <CardDescription>
                                Uses the original API enhanced with backend support via compatibility layer
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FormTemplateSelection
                                onSelectTemplate={handleOriginalTemplateSelect}
                                selectedTemplateId={selectedOriginalTemplate?.id}
                                workspaceId={workspaceId}
                                useBackendApi={true}
                            />
                        </CardContent>
                    </Card>

                    {selectedOriginalTemplate && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Selected Template (Converted Format)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-semibold mb-2">Template Information</h4>
                                        <div className="space-y-2 text-sm">
                                            <div>
                                                <strong>Name:</strong> {selectedOriginalTemplate.name}
                                            </div>
                                            <div>
                                                <strong>Form Number:</strong> {selectedOriginalTemplate.form_number}
                                            </div>
                                            <div>
                                                <strong>Tax Year:</strong> {selectedOriginalTemplate.tax_year}
                                            </div>
                                            <div>
                                                <strong>Category:</strong> {selectedOriginalTemplate.category}
                                            </div>
                                            <div>
                                                <strong>Complexity:</strong>
                                                <Badge className="ml-2">{selectedOriginalTemplate.complexity}</Badge>
                                            </div>
                                            <div>
                                                <strong>Estimated Time:</strong>{' '}
                                                {selectedOriginalTemplate.estimated_time} minutes
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold mb-2">Sections</h4>
                                        <div className="space-y-1 text-sm">
                                            {selectedOriginalTemplate.sections.map((section) => (
                                                <div key={section.id} className="flex justify-between">
                                                    <span>{section.title}</span>
                                                    <span className="text-gray-500">
                                                        {section.fields.length} fields
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <h4 className="font-semibold mb-2">Description</h4>
                                    <p className="text-sm text-gray-600">{selectedOriginalTemplate.description}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>

            {/* Action buttons */}
            <div className="flex gap-4 justify-center">
                <Button
                    onClick={() => {
                        setSelectedBackendTemplate(null)
                        setSelectedOriginalTemplate(null)
                    }}
                    variant="outline"
                >
                    Clear Selections
                </Button>

                {(selectedBackendTemplate || selectedOriginalTemplate) && <Button>Use Selected Template</Button>}
            </div>
        </div>
    )
}
