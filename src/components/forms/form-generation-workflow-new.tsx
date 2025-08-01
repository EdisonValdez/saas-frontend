'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  FileText, Settings, Zap, CheckCircle, AlertTriangle, 
  Clock, Search, Calculator, Eye, Download,
  Loader2, ArrowRight, RotateCcw
} from 'lucide-react'
import FormTemplateSelection from './form-template-selection'
import FormPreviewDialog from './form-preview-dialog'
import FormManagementPanel from './form-management-panel'
import { useGenerateForm, useTaxFormTemplate } from '@/hooks/use-tax-form-templates'
import type { TaxFormTemplate, FormGenerationRequest } from '@/types/tax-forms'
import { toast } from 'sonner'

interface GenerationStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  timeEstimate?: string
  details?: string[]
  error?: string
}

interface FormGenerationWorkflowProps {
  workspaceId: string
  clientId?: string
  clientData?: Record<string, any>
  preSelectedTemplateId?: string
  onComplete?: (results: any) => void
}

export default function FormGenerationWorkflow({ 
  workspaceId,
  clientId, 
  clientData = {},
  preSelectedTemplateId,
  onComplete 
}: FormGenerationWorkflowProps) {
  const [currentStep, setCurrentStep] = useState<'template' | 'configure' | 'generate' | 'complete'>('template')
  const [selectedTemplate, setSelectedTemplate] = useState<TaxFormTemplate | null>(null)
  const [generationConfig, setGenerationConfig] = useState({
    form_name: '',
    save_as_draft: false,
    client_data: clientData
  })
  const [overallProgress, setOverallProgress] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  const [showManagement, setShowManagement] = useState(false)
  const [generatedFormData, setGeneratedFormData] = useState<any>(null)
  
  // API hooks
  const generateFormMutation = useGenerateForm()
  const { data: preSelectedTemplate } = useTaxFormTemplate(preSelectedTemplateId || '', !!preSelectedTemplateId)

  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([
    {
      id: 'validation',
      title: 'Data Validation',
      description: 'Validating client data and template requirements',
      status: 'pending',
      progress: 0,
      timeEstimate: '15 seconds',
      details: [
        'Checking required fields completeness',
        'Validating data formats and types',
        'Verifying template compatibility'
      ]
    },
    {
      id: 'mapping',
      title: 'Field Mapping',
      description: 'Mapping client data to template fields',
      status: 'pending',
      progress: 0,
      timeEstimate: '30 seconds',
      details: [
        'Applying intelligent field mappings',
        'Resolving data conflicts',
        'Setting calculated field formulas'
      ]
    },
    {
      id: 'calculation',
      title: 'Calculations',
      description: 'Performing tax calculations and validations',
      status: 'pending',
      progress: 0,
      timeEstimate: '45 seconds',
      details: [
        'Computing tax liabilities',
        'Applying deductions and credits',
        'Validating calculation accuracy'
      ]
    },
    {
      id: 'generation',
      title: 'Form Generation',
      description: 'Generating form using selected template',
      status: 'pending',
      progress: 0,
      timeEstimate: '60 seconds',
      details: [
        'Populating template fields',
        'Generating form document',
        'Creating submission package'
      ]
    }
  ])

  // Set pre-selected template if provided
  React.useEffect(() => {
    if (preSelectedTemplate && !selectedTemplate) {
      setSelectedTemplate(preSelectedTemplate)
      setGenerationConfig(prev => ({
        ...prev,
        form_name: `${preSelectedTemplate.form_number} - ${new Date().toLocaleDateString()}`
      }))
      setCurrentStep('configure')
    }
  }, [preSelectedTemplate, selectedTemplate])

  const handleTemplateSelect = useCallback((template: TaxFormTemplate) => {
    setSelectedTemplate(template)
    setGenerationConfig(prev => ({
      ...prev,
      form_name: `${template.form_number} - ${new Date().toLocaleDateString()}`
    }))
    setCurrentStep('configure')
  }, [])

  const handleStartGeneration = useCallback(async () => {
    if (!selectedTemplate) return

    setCurrentStep('generate')
    setOverallProgress(0)

    const request: FormGenerationRequest = {
      template_id: selectedTemplate.id,
      client_data: generationConfig.client_data,
      workspace_id: workspaceId,
      form_name: generationConfig.form_name,
      save_as_draft: generationConfig.save_as_draft
    }

    try {
      // Simulate step-by-step progress
      for (let i = 0; i < generationSteps.length; i++) {
        setGenerationSteps(prev => prev.map((step, index) => 
          index === i ? { ...step, status: 'processing', progress: 0 } : step
        ))

        // Simulate progress within each step
        for (let progress = 0; progress <= 100; progress += 20) {
          await new Promise(resolve => setTimeout(resolve, 150))
          
          setGenerationSteps(prev => prev.map((step, index) => 
            index === i ? { ...step, progress } : step
          ))
          
          setOverallProgress(((i * 100 + progress) / generationSteps.length))
        }

        setGenerationSteps(prev => prev.map((step, index) => 
          index === i ? { ...step, status: 'completed', progress: 100 } : step
        ))
      }

      // Call the actual API
      const result = await generateFormMutation.mutateAsync(request)
      
      if (result.success) {
        setGeneratedFormData(result.data)
        setCurrentStep('complete')
        setOverallProgress(100)
        toast.success('Form generated successfully!')
        
        if (onComplete) {
          onComplete({
            success: true,
            form: result.data,
            template: selectedTemplate
          })
        }
      } else {
        throw new Error(result.error || 'Generation failed')
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Form generation failed'
      
      // Mark current step as error
      setGenerationSteps(prev => prev.map((step, index) => 
        index === generationSteps.findIndex(s => s.status === 'processing') ? { 
          ...step, 
          status: 'error', 
          error: errorMessage 
        } : step
      ))
      
      toast.error(errorMessage)
    }
  }, [selectedTemplate, generationConfig, workspaceId, generateFormMutation, generationSteps, onComplete])

  const retryGeneration = () => {
    setGenerationSteps(prev => prev.map(step => ({
      ...step,
      status: 'pending',
      progress: 0,
      error: undefined
    })))
    setOverallProgress(0)
    handleStartGeneration()
  }

  const resetWorkflow = () => {
    setCurrentStep('template')
    setSelectedTemplate(null)
    setGeneratedFormData(null)
    setGenerationSteps(prev => prev.map(step => ({
      ...step,
      status: 'pending',
      progress: 0,
      error: undefined
    })))
    setOverallProgress(0)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'processing':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tax Form Generation</h1>
          <p className="text-gray-600 mt-1">
            Select a template, configure data, and generate your tax form
          </p>
        </div>
        
        <div className="flex space-x-2">
          {currentStep !== 'template' && (
            <Button variant="outline" onClick={resetWorkflow}>
              <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
              Start Over
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setShowManagement(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Management
          </Button>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Badge variant={currentStep === 'template' ? 'default' : 'secondary'}>
                1. Template
              </Badge>
              <ArrowRight className="h-4 w-4 text-gray-400" />
              <Badge variant={currentStep === 'configure' ? 'default' : 'secondary'}>
                2. Configure
              </Badge>
              <ArrowRight className="h-4 w-4 text-gray-400" />
              <Badge variant={currentStep === 'generate' ? 'default' : 'secondary'}>
                3. Generate
              </Badge>
              <ArrowRight className="h-4 w-4 text-gray-400" />
              <Badge variant={currentStep === 'complete' ? 'default' : 'secondary'}>
                4. Complete
              </Badge>
            </div>
          </div>
          
          {overallProgress > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span>{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step Content */}
      {currentStep === 'template' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="w-5 h-5" />
              <span>Select Tax Form Template</span>
            </CardTitle>
            <CardDescription>
              Choose the appropriate tax form template for generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormTemplateSelection
              onSelectTemplate={handleTemplateSelect}
              selectedTemplateId={selectedTemplate?.id}
              workspaceId={workspaceId}
            />
          </CardContent>
        </Card>
      )}

      {currentStep === 'configure' && selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Configure Generation</span>
            </CardTitle>
            <CardDescription>
              Configure the form generation settings and client data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-4">Selected Template</h3>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{selectedTemplate.form_number}</h4>
                      <Badge>{selectedTemplate.complexity}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{selectedTemplate.name}</p>
                    <div className="flex items-center text-xs text-gray-500 space-x-4">
                      <span>{selectedTemplate.tax_year}</span>
                      <span>{selectedTemplate.category}</span>
                      <span>v{selectedTemplate.version}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Generation Settings</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="form-name">Form Name</Label>
                    <Input
                      id="form-name"
                      value={generationConfig.form_name}
                      onChange={(e) => setGenerationConfig(prev => ({
                        ...prev,
                        form_name: e.target.value
                      }))}
                      placeholder="Enter form name..."
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="save-draft"
                      checked={generationConfig.save_as_draft}
                      onCheckedChange={(checked) => setGenerationConfig(prev => ({
                        ...prev,
                        save_as_draft: !!checked
                      }))}
                    />
                    <Label htmlFor="save-draft">Save as draft</Label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setCurrentStep('template')}>
                Back
              </Button>
              <Button 
                onClick={handleStartGeneration}
                disabled={!generationConfig.form_name.trim() || generateFormMutation.isPending}
              >
                {generateFormMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Generate Form
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 'generate' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>Generating Form</span>
            </CardTitle>
            <CardDescription>
              Processing your form generation request
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generationSteps.map((step, index) => (
                <div key={step.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(step.status)}
                      <div>
                        <h4 className="font-medium">{step.title}</h4>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(step.status)}>
                      {step.status}
                    </Badge>
                  </div>
                  
                  {step.status === 'processing' && (
                    <div className="mt-2">
                      <Progress value={step.progress} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">
                        Estimated time: {step.timeEstimate}
                      </p>
                    </div>
                  )}
                  
                  {step.error && (
                    <Alert className="mt-2">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{step.error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              ))}
            </div>
            
            {generationSteps.some(step => step.status === 'error') && (
              <div className="mt-4 flex justify-end">
                <Button onClick={retryGeneration}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retry Generation
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {currentStep === 'complete' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>Generation Complete</span>
            </CardTitle>
            <CardDescription>
              Your tax form has been successfully generated
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Success!</h3>
              <p className="text-gray-600 mb-6">
                Your form has been generated and is ready for review
              </p>
              
              <div className="flex justify-center space-x-2">
                <Button onClick={() => setShowPreview(true)}>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Form
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" onClick={resetWorkflow}>
                  Generate Another
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      {showPreview && (
        <FormPreviewDialog
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          formData={generatedFormData}
          template={selectedTemplate}
        />
      )}

      {showManagement && (
        <FormManagementPanel
          isOpen={showManagement}
          onClose={() => setShowManagement(false)}
          workspaceId={workspaceId}
        />
      )}
    </div>
  )
}
