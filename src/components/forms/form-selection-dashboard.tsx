'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Search, Filter, Download, Eye, Edit3, Check, Clock, AlertTriangle, 
  FileText, Users, Building, Briefcase, Heart, Star, History, 
  Calendar, MapPin, CheckCircle, XCircle, Loader2, MoreHorizontal,
  ArrowUpDown, Grid, List, Bookmark, Share, Settings
} from 'lucide-react'
import { toast } from 'sonner'

interface TaxForm {
  id: string
  formNumber: string
  title: string
  description: string
  category: 'income' | 'deduction' | 'credit' | 'information'
  entityTypes: string[]
  jurisdiction: 'federal' | 'state'
  year: number
  complexity: 'simple' | 'moderate' | 'complex'
  estimatedTime: number // in minutes
  completionStatus: 'not_started' | 'in_progress' | 'completed' | 'filed'
  completionPercentage: number
  lastModified?: string
  version: string
  requirements: string[]
  relatedForms: string[]
  filingDeadline?: string
  isRequired: boolean
  status: 'draft' | 'review' | 'finalized' | 'filed'
  isRecentlyUsed: boolean
  isRecommended: boolean
  isBookmarked: boolean
  tags: string[]
}

interface FilterState {
  search: string
  category: string
  entityType: string
  jurisdiction: string
  year: string
  complexity: string
  status: string
  completionStatus: string
}

interface BatchOperation {
  selectedForms: string[]
  operation: 'export' | 'generate' | 'review' | 'finalize'
  progress: number
  isProcessing: boolean
}

const FORM_CATEGORIES = [
  { value: 'income', label: 'Income Tax Forms', icon: '💰', color: 'bg-green-100 text-green-800' },
  { value: 'deduction', label: 'Deduction Forms', icon: '📉', color: 'bg-blue-100 text-blue-800' },
  { value: 'credit', label: 'Tax Credit Forms', icon: '🎯', color: 'bg-purple-100 text-purple-800' },
  { value: 'information', label: 'Information Returns', icon: '📋', color: 'bg-orange-100 text-orange-800' }
]

const ENTITY_TYPES = [
  { value: 'individual', label: 'Individual/Personal', icon: Users },
  { value: 'business', label: 'Business/Corporate', icon: Building },
  { value: 'partnership', label: 'Partnership', icon: Briefcase },
  { value: 'trust', label: 'Trust/Estate', icon: Heart }
]

const COMPLEXITY_LEVELS = [
  { value: 'simple', label: 'Simple', color: 'bg-green-100 text-green-800', time: '< 30 min' },
  { value: 'moderate', label: 'Moderate', color: 'bg-yellow-100 text-yellow-800', time: '30-90 min' },
  { value: 'complex', label: 'Complex', color: 'bg-red-100 text-red-800', time: '> 90 min' }
]

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: Edit3 },
  { value: 'review', label: 'Under Review', color: 'bg-yellow-100 text-yellow-800', icon: Eye },
  { value: 'finalized', label: 'Finalized', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  { value: 'filed', label: 'Filed', color: 'bg-green-100 text-green-800', icon: Check }
]

export default function FormSelectionDashboard() {
  const [forms, setForms] = useState<TaxForm[]>([])
  const [filteredForms, setFilteredForms] = useState<TaxForm[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedForm, setSelectedForm] = useState<TaxForm | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [batchOperation, setBatchOperation] = useState<BatchOperation>({
    selectedForms: [],
    operation: 'export',
    progress: 0,
    isProcessing: false
  })

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: '',
    entityType: '',
    jurisdiction: '',
    year: '',
    complexity: '',
    status: '',
    completionStatus: ''
  })

  // Load forms data
  useEffect(() => {
    const loadForms = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/forms/list')
        if (response.ok) {
          const data = await response.json()
          setForms(data.forms)
          setFilteredForms(data.forms)
        }
      } catch (error) {
        toast.error('Failed to load forms')
      } finally {
        setIsLoading(false)
      }
    }

    loadForms()
  }, [])

  // Filter forms based on current filters
  const applyFilters = useCallback(() => {
    let filtered = [...forms]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(form => 
        form.formNumber.toLowerCase().includes(searchLower) ||
        form.title.toLowerCase().includes(searchLower) ||
        form.description.toLowerCase().includes(searchLower) ||
        form.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(form => form.category === filters.category)
    }

    // Entity type filter
    if (filters.entityType) {
      filtered = filtered.filter(form => form.entityTypes.includes(filters.entityType))
    }

    // Jurisdiction filter
    if (filters.jurisdiction) {
      filtered = filtered.filter(form => form.jurisdiction === filters.jurisdiction)
    }

    // Year filter
    if (filters.year) {
      filtered = filtered.filter(form => form.year.toString() === filters.year)
    }

    // Complexity filter
    if (filters.complexity) {
      filtered = filtered.filter(form => form.complexity === filters.complexity)
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(form => form.status === filters.status)
    }

    // Completion status filter
    if (filters.completionStatus) {
      filtered = filtered.filter(form => form.completionStatus === filters.completionStatus)
    }

    setFilteredForms(filtered)
  }, [forms, filters])

  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  // Group forms by category for organized display
  const groupedForms = useMemo(() => {
    const groups: Record<string, TaxForm[]> = {}
    filteredForms.forEach(form => {
      if (!groups[form.category]) {
        groups[form.category] = []
      }
      groups[form.category].push(form)
    })
    return groups
  }, [filteredForms])

  // Recently used and recommended forms
  const recentlyUsedForms = useMemo(() => 
    forms.filter(form => form.isRecentlyUsed).slice(0, 5), [forms]
  )

  const recommendedForms = useMemo(() => 
    forms.filter(form => form.isRecommended).slice(0, 5), [forms]
  )

  // Batch operations
  const toggleFormSelection = (formId: string) => {
    setBatchOperation(prev => ({
      ...prev,
      selectedForms: prev.selectedForms.includes(formId)
        ? prev.selectedForms.filter(id => id !== formId)
        : [...prev.selectedForms, formId]
    }))
  }

  const selectAllVisibleForms = () => {
    setBatchOperation(prev => ({
      ...prev,
      selectedForms: filteredForms.map(form => form.id)
    }))
  }

  const clearSelection = () => {
    setBatchOperation(prev => ({
      ...prev,
      selectedForms: []
    }))
  }

  const executeBatchOperation = async () => {
    if (batchOperation.selectedForms.length === 0) {
      toast.error('No forms selected')
      return
    }

    setBatchOperation(prev => ({ ...prev, isProcessing: true, progress: 0 }))

    try {
      const response = await fetch('/api/forms/batch-operation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formIds: batchOperation.selectedForms,
          operation: batchOperation.operation
        })
      })

      if (response.ok) {
        // Simulate progress
        for (let i = 0; i <= 100; i += 10) {
          setBatchOperation(prev => ({ ...prev, progress: i }))
          await new Promise(resolve => setTimeout(resolve, 200))
        }

        toast.success(`Batch ${batchOperation.operation} completed successfully`)
        clearSelection()
      }
    } catch (error) {
      toast.error(`Failed to execute batch ${batchOperation.operation}`)
    } finally {
      setBatchOperation(prev => ({ ...prev, isProcessing: false, progress: 0 }))
    }
  }

  const openFormPreview = (form: TaxForm) => {
    setSelectedForm(form)
    setIsPreviewOpen(true)
  }

  const getStatusIcon = (status: string) => {
    const statusConfig = STATUS_OPTIONS.find(s => s.value === status)
    return statusConfig?.icon || FileText
  }

  const getComplexityColor = (complexity: string) => {
    const complexityConfig = COMPLEXITY_LEVELS.find(c => c.value === complexity)
    return complexityConfig?.color || 'bg-gray-100 text-gray-800'
  }

  const renderFormCard = (form: TaxForm) => {
    const StatusIcon = getStatusIcon(form.status)
    const isSelected = batchOperation.selectedForms.includes(form.id)

    return (
      <Card key={form.id} className={`relative transition-all hover:shadow-lg ${isSelected ? 'ring-2 ring-primary' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => toggleFormSelection(form.id)}
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <Badge variant="outline" className="font-mono text-xs">
                    {form.formNumber}
                  </Badge>
                  {form.isRequired && (
                    <Badge variant="destructive" className="text-xs">Required</Badge>
                  )}
                  {form.isRecommended && (
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  )}
                  {form.isBookmarked && (
                    <Bookmark className="w-4 h-4 text-blue-500 fill-current" />
                  )}
                </div>
                <CardTitle className="text-lg leading-tight">{form.title}</CardTitle>
                <CardDescription className="text-sm mt-1 line-clamp-2">
                  {form.description}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Status and Progress */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <StatusIcon className="w-4 h-4" />
                <Badge className={STATUS_OPTIONS.find(s => s.value === form.status)?.color}>
                  {STATUS_OPTIONS.find(s => s.value === form.status)?.label}
                </Badge>
              </div>
              <div className="text-sm text-gray-500">
                {form.completionPercentage}% complete
              </div>
            </div>

            <Progress value={form.completionPercentage} className="h-2" />

            {/* Form details */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3 text-gray-400" />
                <span>{form.estimatedTime} min</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3 text-gray-400" />
                <span>{form.year}</span>
              </div>
              <div className="col-span-2">
                <Badge className={getComplexityColor(form.complexity)}>
                  {COMPLEXITY_LEVELS.find(c => c.value === form.complexity)?.label}
                </Badge>
              </div>
            </div>

            {/* Entity types */}
            <div className="flex flex-wrap gap-1">
              {form.entityTypes.map(entityType => (
                <Badge key={entityType} variant="secondary" className="text-xs">
                  {ENTITY_TYPES.find(e => e.value === entityType)?.label}
                </Badge>
              ))}
            </div>

            {/* Actions */}
            <div className="flex space-x-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => openFormPreview(form)}
                className="flex-1"
              >
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </Button>
              <Button
                size="sm"
                onClick={() => toast.success('Form generation started')}
                className="flex-1"
              >
                <FileText className="w-4 h-4 mr-1" />
                Generate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderFormList = (form: TaxForm) => {
    const StatusIcon = getStatusIcon(form.status)
    const isSelected = batchOperation.selectedForms.includes(form.id)

    return (
      <div key={form.id} className={`flex items-center space-x-4 p-4 border rounded-lg transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-primary' : ''}`}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => toggleFormSelection(form.id)}
        />
        
        <div className="flex-1 grid grid-cols-6 gap-4 items-center">
          <div className="col-span-2">
            <div className="flex items-center space-x-2 mb-1">
              <Badge variant="outline" className="font-mono text-xs">
                {form.formNumber}
              </Badge>
              {form.isRequired && (
                <Badge variant="destructive" className="text-xs">Required</Badge>
              )}
            </div>
            <h3 className="font-medium">{form.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-1">{form.description}</p>
          </div>
          
          <div className="text-center">
            <Badge className={getComplexityColor(form.complexity)}>
              {COMPLEXITY_LEVELS.find(c => c.value === form.complexity)?.label}
            </Badge>
          </div>
          
          <div className="text-center">
            <div className="flex items-center space-x-1 justify-center">
              <StatusIcon className="w-4 h-4" />
              <Badge className={STATUS_OPTIONS.find(s => s.value === form.status)?.color}>
                {STATUS_OPTIONS.find(s => s.value === form.status)?.label}
              </Badge>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm font-medium">{form.completionPercentage}%</div>
            <Progress value={form.completionPercentage} className="h-1 mt-1" />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => openFormPreview(form)}
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={() => toast.success('Form generation started')}
            >
              <FileText className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading forms...</span>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tax Forms Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Select, preview, and generate tax forms for your clients
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
          </Button>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter Forms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by form number, title, or description..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <Select
              value={filters.category}
              onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {FORM_CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.entityType}
              onValueChange={(value) => setFilters(prev => ({ ...prev, entityType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Entity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Entities</SelectItem>
                {ENTITY_TYPES.map(entity => (
                  <SelectItem key={entity.value} value={entity.value}>
                    {entity.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.jurisdiction}
              onValueChange={(value) => setFilters(prev => ({ ...prev, jurisdiction: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Jurisdiction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="federal">Federal</SelectItem>
                <SelectItem value="state">State</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.year}
              onValueChange={(value) => setFilters(prev => ({ ...prev, year: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Years</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.complexity}
              onValueChange={(value) => setFilters(prev => ({ ...prev, complexity: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Complexity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Levels</SelectItem>
                {COMPLEXITY_LEVELS.map(level => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                {STATUS_OPTIONS.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.completionStatus}
              onValueChange={(value) => setFilters(prev => ({ ...prev, completionStatus: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Completion" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="not_started">Not Started</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="filed">Filed</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setFilters({
                search: '', category: '', entityType: '', jurisdiction: '',
                year: '', complexity: '', status: '', completionStatus: ''
              })}
            >
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Batch Operations */}
      {batchOperation.selectedForms.length > 0 && (
        <Card className="border-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="font-medium">
                  {batchOperation.selectedForms.length} forms selected
                </span>
                <Button size="sm" variant="outline" onClick={selectAllVisibleForms}>
                  Select All Visible
                </Button>
                <Button size="sm" variant="outline" onClick={clearSelection}>
                  Clear Selection
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Select
                  value={batchOperation.operation}
                  onValueChange={(value) => setBatchOperation(prev => ({ 
                    ...prev, 
                    operation: value as any 
                  }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="export">Export PDF</SelectItem>
                    <SelectItem value="generate">Generate Forms</SelectItem>
                    <SelectItem value="review">Send to Review</SelectItem>
                    <SelectItem value="finalize">Finalize</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  onClick={executeBatchOperation}
                  disabled={batchOperation.isProcessing}
                >
                  {batchOperation.isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Execute
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {batchOperation.isProcessing && (
              <div className="mt-4">
                <Progress value={batchOperation.progress} />
                <p className="text-sm text-gray-600 mt-1">
                  Processing {batchOperation.operation}... {batchOperation.progress}%
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Access Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recently Used */}
        {recentlyUsedForms.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <History className="w-5 h-5" />
                <span>Recently Used</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentlyUsedForms.map(form => (
                  <div key={form.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                    <div>
                      <span className="font-medium">{form.formNumber}</span>
                      <span className="text-sm text-gray-600 ml-2">{form.title}</span>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => openFormPreview(form)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommended Forms */}
        {recommendedForms.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span>Recommended for You</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recommendedForms.map(form => (
                  <div key={form.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                    <div>
                      <span className="font-medium">{form.formNumber}</span>
                      <span className="text-sm text-gray-600 ml-2">{form.title}</span>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => openFormPreview(form)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Forms Display */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Forms ({filteredForms.length})</TabsTrigger>
          {FORM_CATEGORIES.map(category => {
            const count = groupedForms[category.value]?.length || 0
            return (
              <TabsTrigger key={category.value} value={category.value}>
                {category.icon} {category.label} ({count})
              </TabsTrigger>
            )
          })}
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredForms.map(renderFormCard)}
            </div>
          ) : (
            <div className="space-y-4">
              {/* List Header */}
              <div className="grid grid-cols-6 gap-4 p-4 bg-gray-50 rounded-lg font-medium text-sm">
                <div className="col-span-2">Form Details</div>
                <div className="text-center">Complexity</div>
                <div className="text-center">Status</div>
                <div className="text-center">Progress</div>
                <div className="text-center">Actions</div>
              </div>
              {filteredForms.map(renderFormList)}
            </div>
          )}
        </TabsContent>

        {FORM_CATEGORIES.map(category => (
          <TabsContent key={category.value} value={category.value} className="space-y-6">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(groupedForms[category.value] || []).map(renderFormCard)}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-6 gap-4 p-4 bg-gray-50 rounded-lg font-medium text-sm">
                  <div className="col-span-2">Form Details</div>
                  <div className="text-center">Complexity</div>
                  <div className="text-center">Status</div>
                  <div className="text-center">Progress</div>
                  <div className="text-center">Actions</div>
                </div>
                {(groupedForms[category.value] || []).map(renderFormList)}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Form Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>{selectedForm?.formNumber} - {selectedForm?.title}</span>
            </DialogTitle>
            <DialogDescription>
              Preview form template and data population
            </DialogDescription>
          </DialogHeader>
          
          {selectedForm && (
            <div className="grid grid-cols-2 gap-6 h-96">
              <div>
                <h4 className="font-medium mb-2">Form Template</h4>
                <div className="border rounded-lg p-4 bg-gray-50 h-full overflow-auto">
                  <p className="text-sm text-gray-600">
                    Form template preview would be displayed here...
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Data Population</h4>
                <div className="border rounded-lg p-4 h-full overflow-auto">
                  <p className="text-sm text-gray-600">
                    Field-by-field data mapping preview would be displayed here...
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
