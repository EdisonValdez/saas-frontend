'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  FileText, Settings, Zap, CheckCircle, AlertTriangle,
  Clock, User, Database, Calculator, Eye, Download,
  Loader2, ArrowRight, Play, Pause, RotateCcw, Search
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
  const [showFormSelection, setShowFormSelection] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showManagement, setShowManagement] = useState(false)

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
          <h1 className="text-3xl font-bold">Form Generation Workflow</h1>
          <p className="text-gray-600 mt-1">
            Complete tax form generation and management system
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowFormSelection(true)}
          >
            <FileText className="w-4 h-4 mr-2" />
            Select Forms
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowManagement(true)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Management
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" 
              onClick={() => setShowFormSelection(true)}>
          <CardContent className="p-4 text-center">
            <FileText className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <div className="font-medium">Select Forms</div>
            <div className="text-sm text-gray-600">Choose forms to generate</div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setShowPreview(true)}>
          <CardContent className="p-4 text-center">
            <Eye className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <div className="font-medium">Preview Forms</div>
            <div className="text-sm text-gray-600">Review before generation</div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
            <div className="font-medium">Generate</div>
            <div className="text-sm text-gray-600">Start form generation</div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setShowManagement(true)}>
          <CardContent className="p-4 text-center">
            <Settings className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <div className="font-medium">Manage</div>
            <div className="text-sm text-gray-600">Version control & status</div>
          </CardContent>
        </Card>
      </div>

      {/* Generation Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>Generation Progress</span>
              </CardTitle>
              <CardDescription>
                Track the progress of form generation workflow
              </CardDescription>
            </div>
            
            <div className="flex space-x-2">
              {!isGenerating && !isPaused && (
                <Button onClick={startGeneration} disabled={selectedFormIds.length === 0}>
                  <Play className="w-4 h-4 mr-2" />
                  Start Generation
                </Button>
              )}
              
              {isGenerating && (
                <Button variant="outline" onClick={pauseGeneration}>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
              )}
              
              {isPaused && (
                <>
                  <Button onClick={resumeGeneration}>
                    <Play className="w-4 h-4 mr-2" />
                    Resume
                  </Button>
                  <Button variant="outline" onClick={retryGeneration}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Retry
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">Overall Progress</span>
              <span className="text-sm text-gray-600">
                {Math.round(overallProgress)}% Complete
              </span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>

          {/* Selected Forms Summary */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-blue-900">Selected Forms</h4>
              <Badge variant="outline" className="text-blue-700">
                {selectedFormIds.length} forms
              </Badge>
            </div>
            <div className="text-sm text-blue-800">
              {selectedFormIds.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedFormIds.map(formId => (
                    <Badge key={formId} variant="secondary">
                      Form {formId}
                    </Badge>
                  ))}
                </div>
              ) : (
                'No forms selected. Click "Select Forms" to choose forms for generation.'
              )}
            </div>
          </div>

          {/* Generation Steps */}
          <div className="space-y-4">
            <h4 className="font-medium">Generation Steps</h4>
            <div className="space-y-3">
              {generationSteps.map((step, index) => (
                <div key={step.id} className={`p-4 border rounded-lg ${getStatusColor(step.status)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(step.status)}
                      <div>
                        <div className="font-medium">{step.title}</div>
                        <div className="text-sm opacity-80">{step.description}</div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {step.progress}%
                      </div>
                      {step.timeEstimate && step.status === 'pending' && (
                        <div className="text-xs opacity-70">
                          Est. {step.timeEstimate}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {step.status !== 'pending' && (
                    <Progress value={step.progress} className="h-2 mb-2" />
                  )}
                  
                  {step.error && (
                    <Alert className="mt-2 border-red-200 bg-red-50">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <AlertDescription className="text-red-700">
                        {step.error}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {step.details && (step.status === 'processing' || step.status === 'completed') && (
                    <div className="mt-2 text-sm">
                      <div className="font-medium mb-1">Details:</div>
                      <ul className="space-y-1 opacity-80">
                        {step.details.map((detail, i) => (
                          <li key={i} className="flex items-center space-x-2">
                            <div className="w-1 h-1 bg-current rounded-full" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Selection Dialog */}
      <Dialog open={showFormSelection} onOpenChange={setShowFormSelection}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Select Tax Forms</DialogTitle>
            <DialogDescription>
              Choose the forms you want to generate for this client
            </DialogDescription>
          </DialogHeader>
          <div className="h-[80vh] overflow-auto">
            <FormSelectionDashboard />
          </div>
        </DialogContent>
      </Dialog>

      {/* Form Preview Dialog */}
      <FormPreviewDialog
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        formId={selectedFormForPreview || selectedFormIds[0] || 'form-1'}
        clientId={clientId}
      />

      {/* Form Management Dialog */}
      <Dialog open={showManagement} onOpenChange={setShowManagement}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Form Management</DialogTitle>
            <DialogDescription>
              Manage form versions, status, and electronic signatures
            </DialogDescription>
          </DialogHeader>
          <div className="h-[80vh] overflow-auto">
            <FormManagementPanel
              formId={selectedFormForManagement || selectedFormIds[0] || 'form-1'}
              currentStatus="review"
              onStatusChange={(status) => toast.success(`Status updated to ${status}`)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
