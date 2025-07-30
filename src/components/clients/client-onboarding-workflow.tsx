'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Loader2, Upload, FileText, CheckCircle, AlertTriangle, ArrowLeft, ArrowRight, Save, Eye, Edit3 } from 'lucide-react'
import { toast } from 'sonner'

interface OnboardingData {
  // Step 1: Basic Information
  clientName: string
  entityType: 'individual' | 'corporation' | 'partnership' | 'llc' | 'trust'
  taxId: string
  
  // Step 2: Contact Details
  primaryContactName: string
  email: string
  phone: string
  role: string
  address: string
  
  // Step 3: Documents
  uploadedFiles: File[]
  
  // Step 4: Data Mapping
  extractedData: Record<string, any>
  fieldMappings: Record<string, string>
  
  // Session Management
  sessionId?: string
  savedAt?: string
}

interface ValidationErrors {
  [key: string]: string
}

interface StepConfig {
  title: string
  description: string
  isOptional?: boolean
}

const STEPS: StepConfig[] = [
  {
    title: 'Basic Information',
    description: 'Enter client details and tax identification'
  },
  {
    title: 'Contact Details',
    description: 'Add primary contact information'
  },
  {
    title: 'Document Upload',
    description: 'Upload tax forms and supporting documents'
  },
  {
    title: 'Data Mapping',
    description: 'Review and confirm extracted data mappings'
  },
  {
    title: 'Review & Finalize',
    description: 'Confirm all information and complete onboarding'
  }
]

const ENTITY_TYPES = [
  { value: 'individual', label: 'Individual/Sole Proprietor' },
  { value: 'corporation', label: 'Corporation (C-Corp/S-Corp)' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'llc', label: 'Limited Liability Company (LLC)' },
  { value: 'trust', label: 'Trust/Estate' }
]

const CONTACT_ROLES = [
  { value: 'owner', label: 'Business Owner' },
  { value: 'cfo', label: 'CFO/Financial Officer' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'bookkeeper', label: 'Bookkeeper' },
  { value: 'assistant', label: 'Executive Assistant' },
  { value: 'other', label: 'Other' }
]

export default function ClientOnboardingWorkflow() {
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<OnboardingData>({
    clientName: '',
    entityType: 'individual',
    taxId: '',
    primaryContactName: '',
    email: '',
    phone: '',
    role: '',
    address: '',
    uploadedFiles: [],
    extractedData: {},
    fieldMappings: {}
  })
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [completedSteps, setCompletedSteps] = useState<boolean[]>(new Array(5).fill(false))
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  // Validation functions for each step
  const validateStep1 = (stepData: OnboardingData): ValidationErrors => {
    const errors: ValidationErrors = {}
    
    if (!stepData.clientName.trim()) {
      errors.clientName = 'Client name is required'
    }
    
    if (!stepData.taxId.trim()) {
      errors.taxId = 'Tax ID is required'
    } else {
      // Basic tax ID validation
      const taxIdPattern = stepData.entityType === 'individual' 
        ? /^\d{3}-\d{2}-\d{4}$/ // SSN format
        : /^\d{2}-\d{7}$/ // EIN format
      
      if (!taxIdPattern.test(stepData.taxId)) {
        errors.taxId = stepData.entityType === 'individual' 
          ? 'Invalid SSN format (XXX-XX-XXXX)'
          : 'Invalid EIN format (XX-XXXXXXX)'
      }
    }
    
    return errors
  }

  const validateStep2 = (stepData: OnboardingData): ValidationErrors => {
    const errors: ValidationErrors = {}
    
    if (!stepData.primaryContactName.trim()) {
      errors.primaryContactName = 'Primary contact name is required'
    }
    
    if (!stepData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stepData.email)) {
      errors.email = 'Invalid email format'
    }
    
    if (!stepData.phone.trim()) {
      errors.phone = 'Phone number is required'
    } else if (!/^[\+]?[\d\s\-\(\)\.]{10,}$/.test(stepData.phone)) {
      errors.phone = 'Invalid phone number format'
    }
    
    if (!stepData.role) {
      errors.role = 'Contact role is required'
    }
    
    return errors
  }

  const validateStep3 = (stepData: OnboardingData): ValidationErrors => {
    const errors: ValidationErrors = {}
    
    if (stepData.uploadedFiles.length === 0) {
      errors.files = 'At least one document is required'
    }
    
    return errors
  }

  const validateCurrentStep = useCallback(() => {
    let errors: ValidationErrors = {}
    
    switch (currentStep) {
      case 0:
        errors = validateStep1(data)
        break
      case 1:
        errors = validateStep2(data)
        break
      case 2:
        errors = validateStep3(data)
        break
      case 3:
        // Data mapping step - validation handled separately
        break
      case 4:
        // Review step - no additional validation needed
        break
    }
    
    setValidationErrors(errors)
    const isValid = Object.keys(errors).length === 0
    
    // Update completed steps
    const newCompletedSteps = [...completedSteps]
    newCompletedSteps[currentStep] = isValid
    setCompletedSteps(newCompletedSteps)
    
    return isValid
  }, [currentStep, data, completedSteps])

  // Auto-validate current step when data changes
  useEffect(() => {
    validateCurrentStep()
  }, [validateCurrentStep])

  // Save progress functionality
  const saveProgress = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/onboarding/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: data.sessionId,
          step: currentStep,
          data: { ...data, savedAt: new Date().toISOString() }
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        setData(prev => ({ ...prev, sessionId: result.sessionId }))
        toast.success('Progress saved successfully')
      }
    } catch (error) {
      toast.error('Failed to save progress')
    } finally {
      setIsSaving(false)
    }
  }

  // File upload handlers
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    const validFiles = files.filter(file => {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff']
      return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024 // 10MB limit
    })
    
    setData(prev => ({
      ...prev,
      uploadedFiles: [...prev.uploadedFiles, ...validFiles]
    }))
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }, [])

  const removeFile = (index: number) => {
    setData(prev => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter((_, i) => i !== index)
    }))
  }

  // Process documents and extract data
  const processDocuments = async () => {
    if (data.uploadedFiles.length === 0) return
    
    setIsLoading(true)
    try {
      const formData = new FormData()
      data.uploadedFiles.forEach(file => {
        formData.append('files', file)
      })
      
      const response = await fetch('/api/onboarding/extract-data', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const result = await response.json()
        setData(prev => ({
          ...prev,
          extractedData: result.extractedData,
          fieldMappings: result.suggestedMappings
        }))
      }
    } catch (error) {
      toast.error('Failed to process documents')
    } finally {
      setIsLoading(false)
    }
  }

  // Navigation handlers
  const canProceed = () => {
    return completedSteps[currentStep] || currentStep === 4
  }

  const nextStep = () => {
    if (canProceed() && currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
      
      // Trigger document processing when entering step 4
      if (currentStep === 2) {
        processDocuments()
      }
    }
  }

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name *</Label>
              <Input
                id="clientName"
                value={data.clientName}
                onChange={(e) => setData(prev => ({ ...prev, clientName: e.target.value }))}
                placeholder="Enter client or business name"
                className={validationErrors.clientName ? 'border-red-500' : ''}
              />
              {validationErrors.clientName && (
                <p className="text-sm text-red-500">{validationErrors.clientName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="entityType">Entity Type *</Label>
              <Select value={data.entityType} onValueChange={(value) => 
                setData(prev => ({ ...prev, entityType: value as any, taxId: '' }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENTITY_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxId">
                {data.entityType === 'individual' ? 'Social Security Number' : 'Employer Identification Number'} *
              </Label>
              <Input
                id="taxId"
                value={data.taxId}
                onChange={(e) => setData(prev => ({ ...prev, taxId: e.target.value }))}
                placeholder={data.entityType === 'individual' ? 'XXX-XX-XXXX' : 'XX-XXXXXXX'}
                className={validationErrors.taxId ? 'border-red-500' : ''}
              />
              {validationErrors.taxId && (
                <p className="text-sm text-red-500">{validationErrors.taxId}</p>
              )}
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="primaryContactName">Primary Contact Name *</Label>
              <Input
                id="primaryContactName"
                value={data.primaryContactName}
                onChange={(e) => setData(prev => ({ ...prev, primaryContactName: e.target.value }))}
                placeholder="Enter contact person's full name"
                className={validationErrors.primaryContactName ? 'border-red-500' : ''}
              />
              {validationErrors.primaryContactName && (
                <p className="text-sm text-red-500">{validationErrors.primaryContactName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => setData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="contact@example.com"
                className={validationErrors.email ? 'border-red-500' : ''}
              />
              {validationErrors.email && (
                <p className="text-sm text-red-500">{validationErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={data.phone}
                onChange={(e) => setData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 (555) 123-4567"
                className={validationErrors.phone ? 'border-red-500' : ''}
              />
              {validationErrors.phone && (
                <p className="text-sm text-red-500">{validationErrors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select value={data.role} onValueChange={(value) => 
                setData(prev => ({ ...prev, role: value }))
              }>
                <SelectTrigger className={validationErrors.role ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select contact role" />
                </SelectTrigger>
                <SelectContent>
                  {CONTACT_ROLES.map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.role && (
                <p className="text-sm text-red-500">{validationErrors.role}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Business Address</Label>
              <Textarea
                id="address"
                value={data.address}
                onChange={(e) => setData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter complete business address"
                rows={3}
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive ? 'border-primary bg-primary/5' : 'border-gray-300'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium">Drag and drop your tax documents</p>
                <p className="text-sm text-gray-600">
                  Supported formats: PDF, JPEG, PNG, TIFF (Max 10MB each)
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  Choose Files
                </Button>
                <input
                  id="file-input"
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.tiff"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || [])
                    setData(prev => ({
                      ...prev,
                      uploadedFiles: [...prev.uploadedFiles, ...files]
                    }))
                  }}
                  className="hidden"
                />
              </div>
            </div>

            {validationErrors.files && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-700">
                  {validationErrors.files}
                </AlertDescription>
              </Alert>
            )}

            {data.uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Uploaded Files ({data.uploadedFiles.length})</Label>
                <div className="space-y-2">
                  {data.uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-gray-600">Processing documents and extracting data...</p>
              </div>
            ) : (
              <>
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    We've analyzed your documents and suggested field mappings below. 
                    Please review and adjust as needed.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Extracted Data</h4>
                    <div className="space-y-2 border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                      {Object.entries(data.extractedData).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="font-medium">{key}:</span>
                          <span className="text-gray-600">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Field Mappings</h4>
                    <div className="space-y-3">
                      {Object.entries(data.fieldMappings).map(([sourceField, targetField]) => (
                        <div key={sourceField} className="space-y-1">
                          <Label className="text-sm">{sourceField}</Label>
                          <Select
                            value={targetField}
                            onValueChange={(value) => {
                              setData(prev => ({
                                ...prev,
                                fieldMappings: {
                                  ...prev.fieldMappings,
                                  [sourceField]: value
                                }
                              }))
                            }}
                          >
                            <SelectTrigger className="text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="client_name">Client Name</SelectItem>
                              <SelectItem value="tax_id">Tax ID</SelectItem>
                              <SelectItem value="contact_name">Contact Name</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="phone">Phone</SelectItem>
                              <SelectItem value="address">Address</SelectItem>
                              <SelectItem value="ignore">Ignore Field</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Please review all information below before finalizing the client onboarding.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="font-medium">Client Name:</span>
                    <span className="ml-2">{data.clientName}</span>
                  </div>
                  <div>
                    <span className="font-medium">Entity Type:</span>
                    <span className="ml-2">
                      {ENTITY_TYPES.find(t => t.value === data.entityType)?.label}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Tax ID:</span>
                    <span className="ml-2">{data.taxId}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="font-medium">Contact Name:</span>
                    <span className="ml-2">{data.primaryContactName}</span>
                  </div>
                  <div>
                    <span className="font-medium">Email:</span>
                    <span className="ml-2">{data.email}</span>
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span>
                    <span className="ml-2">{data.phone}</span>
                  </div>
                  <div>
                    <span className="font-medium">Role:</span>
                    <span className="ml-2">
                      {CONTACT_ROLES.find(r => r.value === data.role)?.label}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Uploaded Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {data.uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">{file.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Data Mappings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    {Object.entries(data.fieldMappings).map(([source, target]) => (
                      <div key={source}>
                        <span className="font-medium">{source}</span>
                        <span className="text-gray-500"> → {target}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const progress = ((currentStep + 1) / STEPS.length) * 100

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Client Onboarding</h1>
        <p className="text-gray-600">
          Complete the following steps to add a new client to your system
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium">
            Step {currentStep + 1} of {STEPS.length}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <Progress value={progress} className="mb-4" />
        
        {/* Step indicators */}
        <div className="flex justify-between">
          {STEPS.map((step, index) => (
            <div key={index} className="flex flex-col items-center space-y-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index === currentStep 
                  ? 'bg-primary text-primary-foreground'
                  : completedSteps[index]
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {completedSteps[index] ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              <div className="text-center">
                <p className="text-xs font-medium">{step.title}</p>
                <p className="text-xs text-gray-500 max-w-24">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>{STEPS[currentStep].title}</CardTitle>
          <CardDescription>{STEPS[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={previousStep}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={saveProgress}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Progress
            </Button>
          </div>
          
          <Button
            onClick={currentStep === STEPS.length - 1 ? () => {
              toast.success('Client onboarding completed successfully!')
            } : nextStep}
            disabled={!canProceed() || isLoading}
          >
            {currentStep === STEPS.length - 1 ? (
              'Complete Onboarding'
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
