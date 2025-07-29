'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  FileText, Edit3, Eye, Save, Download, AlertTriangle, CheckCircle, 
  Info, Calculator, Database, User, Loader2, RefreshCw, Zap,
  TrendingUp, TrendingDown, Minus, ArrowRight
} from 'lucide-react'
import { toast } from 'sonner'

interface FormField {
  id: string
  name: string
  label: string
  type: 'text' | 'number' | 'date' | 'checkbox' | 'select'
  value: any
  isRequired: boolean
  isCalculated: boolean
  validation?: {
    pattern?: string
    min?: number
    max?: number
    options?: string[]
  }
  dataSource?: 'client' | 'extracted' | 'calculated' | 'manual'
  confidence?: number
  hasError?: boolean
  errorMessage?: string
  suggestions?: string[]
}

interface FormPreview {
  formId: string
  formNumber: string
  title: string
  templateUrl: string
  fields: FormField[]
  sections: Array<{
    id: string
    title: string
    fieldIds: string[]
  }>
  dataQuality: {
    completeness: number
    accuracy: number
    overallScore: number
  }
  missingFields: string[]
  validationErrors: Array<{
    fieldId: string
    message: string
    severity: 'error' | 'warning' | 'info'
  }>
  calculations: Array<{
    fieldId: string
    formula: string
    dependencies: string[]
    result: any
  }>
}

interface FormPreviewDialogProps {
  isOpen: boolean
  onClose: () => void
  formId: string
  clientId?: string
}

export default function FormPreviewDialog({ isOpen, onClose, formId, clientId }: FormPreviewDialogProps) {
  const [preview, setPreview] = useState<FormPreview | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editedFields, setEditedFields] = useState<Record<string, any>>({})
  const [activeTab, setActiveTab] = useState('preview')

  // Load form preview data
  useEffect(() => {
    if (isOpen && formId) {
      loadFormPreview()
    }
  }, [isOpen, formId, clientId])

  const loadFormPreview = async () => {
    setIsLoading(true)
    try {
      const url = new URL(`/api/forms/${formId}/preview`, window.location.origin)
      if (clientId) {
        url.searchParams.set('clientId', clientId)
      }

      const response = await fetch(url.toString())
      if (response.ok) {
        const data = await response.json()
        setPreview(data.preview)
        // Initialize edited fields with current values
        const initialFields: Record<string, any> = {}
        data.preview.fields.forEach((field: FormField) => {
          initialFields[field.id] = field.value
        })
        setEditedFields(initialFields)
      }
    } catch (error) {
      toast.error('Failed to load form preview')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFieldChange = (fieldId: string, value: any) => {
    setEditedFields(prev => ({
      ...prev,
      [fieldId]: value
    }))
  }

  const saveChanges = async () => {
    try {
      // In a real app, this would save the changes
      toast.success('Changes saved successfully')
      setEditMode(false)
      // Reload preview with updated data
      loadFormPreview()
    } catch (error) {
      toast.error('Failed to save changes')
    }
  }

  const getDataSourceIcon = (dataSource?: string) => {
    switch (dataSource) {
      case 'client':
        return <User className="w-4 h-4 text-blue-500" />
      case 'extracted':
        return <FileText className="w-4 h-4 text-green-500" />
      case 'calculated':
        return <Calculator className="w-4 h-4 text-purple-500" />
      case 'manual':
        return <Edit3 className="w-4 h-4 text-orange-500" />
      default:
        return <Database className="w-4 h-4 text-gray-500" />
    }
  }

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'text-gray-500'
    if (confidence >= 0.9) return 'text-green-600'
    if (confidence >= 0.7) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getConfidenceIcon = (confidence?: number) => {
    if (!confidence) return <Minus className="w-4 h-4" />
    if (confidence >= 0.9) return <TrendingUp className="w-4 h-4" />
    if (confidence >= 0.7) return <Minus className="w-4 h-4" />
    return <TrendingDown className="w-4 h-4" />
  }

  const renderField = (field: FormField, isInEditMode: boolean = false) => {
    const currentValue = isInEditMode ? editedFields[field.id] : field.value
    const hasValidationError = preview?.validationErrors.some(e => e.fieldId === field.id)

    return (
      <div key={field.id} className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={field.id} className="flex items-center space-x-2">
            <span>{field.label}</span>
            {field.isRequired && <span className="text-red-500">*</span>}
          </Label>
          <div className="flex items-center space-x-2">
            {getDataSourceIcon(field.dataSource)}
            {field.confidence && (
              <div className={`flex items-center space-x-1 ${getConfidenceColor(field.confidence)}`}>
                {getConfidenceIcon(field.confidence)}
                <span className="text-xs">{Math.round(field.confidence * 100)}%</span>
              </div>
            )}
            {field.isCalculated && (
              <Badge variant="secondary" className="text-xs">
                <Calculator className="w-3 h-3 mr-1" />
                Calculated
              </Badge>
            )}
          </div>
        </div>

        {isInEditMode && !field.isCalculated ? (
          field.type === 'select' ? (
            <Select
              value={currentValue?.toString() || ''}
              onValueChange={(value) => handleFieldChange(field.id, value)}
            >
              <SelectTrigger className={hasValidationError ? 'border-red-500' : ''}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {field.validation?.options?.map(option => (
                  <SelectItem key={option} value={option}>
                    {option.replace('_', ' ').toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : field.type === 'checkbox' ? (
            <Checkbox
              checked={currentValue || false}
              onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
            />
          ) : (
            <Input
              id={field.id}
              type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
              value={currentValue?.toString() || ''}
              onChange={(e) => handleFieldChange(field.id, 
                field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
              )}
              className={hasValidationError ? 'border-red-500' : ''}
            />
          )
        ) : (
          <div className={`p-2 border rounded ${hasValidationError ? 'border-red-500 bg-red-50' : 'bg-gray-50'}`}>
            <span className="font-medium">
              {field.type === 'number' ? 
                new Intl.NumberFormat('en-US', { 
                  style: field.name.includes('income') || field.name.includes('wage') || field.name.includes('expense') ? 'currency' : 'decimal',
                  currency: 'USD'
                }).format(currentValue || 0) : 
                currentValue?.toString() || '(empty)'
              }
            </span>
          </div>
        )}

        {field.hasError && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700">
              {field.errorMessage}
            </AlertDescription>
          </Alert>
        )}

        {hasValidationError && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <Info className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              {preview?.validationErrors.find(e => e.fieldId === field.id)?.message}
            </AlertDescription>
          </Alert>
        )}
      </div>
    )
  }

  if (!preview && !isLoading) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>
                {preview?.formNumber} - {preview?.title}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditMode(!editMode)}
                disabled={isLoading}
              >
                {editMode ? (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    View Mode
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Mode
                  </>
                )}
              </Button>
              {editMode && (
                <Button size="sm" onClick={saveChanges}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              )}
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </DialogTitle>
          <DialogDescription>
            Preview form template with populated data and validation results
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">Loading form preview...</span>
          </div>
        ) : preview && (
          <div className="space-y-6">
            {/* Data Quality Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Data Quality Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {preview.dataQuality.overallScore}%
                    </div>
                    <div className="text-sm text-gray-600">Overall Score</div>
                    <Progress value={preview.dataQuality.overallScore} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {preview.dataQuality.completeness}%
                    </div>
                    <div className="text-sm text-gray-600">Completeness</div>
                    <Progress value={preview.dataQuality.completeness} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {preview.dataQuality.accuracy}%
                    </div>
                    <div className="text-sm text-gray-600">Accuracy</div>
                    <Progress value={preview.dataQuality.accuracy} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {preview.missingFields.length}
                    </div>
                    <div className="text-sm text-gray-600">Missing Fields</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Validation Alerts */}
            {(preview.validationErrors.length > 0 || preview.missingFields.length > 0) && (
              <div className="space-y-2">
                {preview.missingFields.length > 0 && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <AlertDescription className="text-red-700">
                      <strong>Missing Required Fields:</strong> {preview.missingFields.join(', ')}
                    </AlertDescription>
                  </Alert>
                )}
                {preview.validationErrors.map((error, index) => (
                  <Alert key={index} className="border-yellow-200 bg-yellow-50">
                    <Info className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      <strong>{error.fieldId}:</strong> {error.message}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="preview">Side-by-Side Preview</TabsTrigger>
                <TabsTrigger value="template">Form Template</TabsTrigger>
                <TabsTrigger value="data">Data Fields</TabsTrigger>
                <TabsTrigger value="calculations">Calculations</TabsTrigger>
              </TabsList>

              <TabsContent value="preview" className="space-y-4">
                <div className="grid grid-cols-2 gap-6 h-[600px]">
                  {/* Form Template Side */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Form Template</h3>
                      <Badge variant="outline">PDF Preview</Badge>
                    </div>
                    <div className="border rounded-lg bg-gray-50 h-full flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto" />
                        <p className="text-gray-600">Form Template Preview</p>
                        <p className="text-sm text-gray-500">{preview.templateUrl}</p>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View Full Template
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Data Population Side */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Data Population</h3>
                      <Badge variant="outline">{editMode ? 'Edit Mode' : 'View Mode'}</Badge>
                    </div>
                    <ScrollArea className="h-full border rounded-lg p-4">
                      <div className="space-y-6">
                        {preview.sections.map(section => (
                          <div key={section.id} className="space-y-4">
                            <h4 className="font-medium text-base border-b pb-2">
                              {section.title}
                            </h4>
                            <div className="grid gap-4">
                              {section.fieldIds.map(fieldId => {
                                const field = preview.fields.find(f => f.id === fieldId)
                                return field ? renderField(field, editMode) : null
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="template" className="space-y-4">
                <div className="border rounded-lg bg-gray-50 h-[600px] flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <FileText className="w-24 h-24 text-gray-400 mx-auto" />
                    <div>
                      <h3 className="text-lg font-medium mb-2">Form Template Viewer</h3>
                      <p className="text-gray-600 mb-4">
                        Full-scale form template would be displayed here
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Template: {preview.templateUrl}
                      </p>
                      <Button>
                        <Download className="w-4 h-4 mr-2" />
                        Download Template
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="data" className="space-y-4">
                <div className="grid gap-4">
                  {preview.fields.map(field => (
                    <Card key={field.id}>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-4 gap-4 items-center">
                          <div>
                            <div className="font-medium">{field.label}</div>
                            <div className="text-sm text-gray-500">{field.name}</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getDataSourceIcon(field.dataSource)}
                            <span className="text-sm capitalize">{field.dataSource}</span>
                          </div>
                          <div className="text-center">
                            {field.confidence && (
                              <div className={`flex items-center justify-center space-x-1 ${getConfidenceColor(field.confidence)}`}>
                                {getConfidenceIcon(field.confidence)}
                                <span className="text-sm">{Math.round(field.confidence * 100)}%</span>
                              </div>
                            )}
                          </div>
                          <div className="font-mono text-sm">
                            {field.type === 'number' ? 
                              new Intl.NumberFormat('en-US', { 
                                style: field.name.includes('income') || field.name.includes('wage') || field.name.includes('expense') ? 'currency' : 'decimal',
                                currency: 'USD'
                              }).format(field.value || 0) : 
                              field.value?.toString() || '(empty)'
                            }
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="calculations" className="space-y-4">
                {preview.calculations.length > 0 ? (
                  <div className="space-y-4">
                    {preview.calculations.map(calc => (
                      <Card key={calc.fieldId}>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <Calculator className="w-5 h-5" />
                            <span>{preview.fields.find(f => f.id === calc.fieldId)?.label}</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label className="text-sm font-medium">Formula</Label>
                              <div className="font-mono text-sm bg-gray-100 p-2 rounded">
                                {calc.formula}
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Dependencies</Label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {calc.dependencies.map(dep => (
                                  <Badge key={dep} variant="secondary" className="text-xs">
                                    {preview.fields.find(f => f.id === dep)?.label || dep}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Result</Label>
                              <div className="text-lg font-bold">
                                {typeof calc.result === 'number' ? 
                                  new Intl.NumberFormat('en-US', { 
                                    style: 'currency',
                                    currency: 'USD'
                                  }).format(calc.result) : 
                                  calc.result?.toString() || '(empty)'
                                }
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calculator className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No Calculations</h3>
                    <p className="text-gray-500">This form has no calculated fields.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
