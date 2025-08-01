'use client'

import React, { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import {
    FileText,
    Calculator,
    Search,
    Filter,
    Eye,
    Edit,
    Download,
    Send,
    Plus,
    Calendar,
    User,
    Building,
    DollarSign,
    Percent,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2,
    MoreHorizontal,
    BookOpen,
    Zap,
    Save,
    PrinterIcon as Print,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { useWorkspaceClients } from '@/lib/hooks/api-hooks'
import { useTaxFormTemplates, useTaxFormTemplatesByYear } from '@/hooks/use-tax-form-templates'
import type { TaxFormTemplate } from '@/types/tax-forms'

interface TaxForm {
    id: string
    name: string
    form_number: string
    tax_year: number
    category: 'individual' | 'business' | 'estate' | 'other'
    status: 'draft' | 'in_progress' | 'review' | 'completed' | 'filed'
    client_id: string
    client_name: string
    created_date: string
    last_updated: string
    due_date?: string
    completion_percentage: number
    estimated_refund?: number
    amount_owed?: number
}

interface FormTemplate {
    id: string
    name: string
    form_number: string
    description: string
    category: 'individual' | 'business' | 'estate' | 'other'
    tax_year: number
    complexity: 'simple' | 'standard' | 'complex'
    estimated_time: string
    required_documents: string[]
    sections: FormSection[]
}

interface FormSection {
    id: string
    title: string
    description: string
    fields: FormField[]
    required: boolean
}

interface FormField {
    id: string
    name: string
    label: string
    type: 'text' | 'number' | 'currency' | 'date' | 'select' | 'checkbox'
    required: boolean
    options?: string[]
    validation?: any
}

// Templates are now loaded dynamically from the API

const STATUS_COLORS = {
    draft: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    review: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    filed: 'bg-purple-100 text-purple-800',
}

const STATUS_ICONS = {
    draft: Edit,
    in_progress: Clock,
    review: Eye,
    completed: CheckCircle2,
    filed: Send,
}

const COMPLEXITY_COLORS = {
    simple: 'bg-green-100 text-green-800',
    standard: 'bg-blue-100 text-blue-800',
    complex: 'bg-red-100 text-red-800',
}

export function TaxFormManagement() {
    const params = useParams<{ workspaceId: string }>()
    const workspaceId = params.workspaceId
    const currentYear = new Date().getFullYear()

    // State management
    const [activeTab, setActiveTab] = useState('forms')
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all' | TaxForm['status']>('all')
    const [categoryFilter, setCategoryFilter] = useState<'all' | TaxForm['category']>('all')
    const [selectedForm, setSelectedForm] = useState<TaxForm | null>(null)
    const [selectedTemplate, setSelectedTemplate] = useState<TaxFormTemplate | null>(null)
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [showFormBuilder, setShowFormBuilder] = useState(false)
    const [formData, setFormData] = useState<any>({})

    // API hooks
    const { data: clientsData } = useWorkspaceClients(workspaceId)
    const clients = clientsData?.clients || []

    // Load tax form templates
    const { data: templatesData, isLoading: templatesLoading } = useTaxFormTemplates({
        tax_year: currentYear,
        is_active: true
    })
    const templates = templatesData?.results || []

    // Mock tax forms data
    const mockForms: TaxForm[] = [
        {
            id: 'form-1',
            name: 'Johnson Individual Return',
            form_number: 'Form 1040',
            tax_year: 2024,
            category: 'individual',
            status: 'in_progress',
            client_id: 'client-1',
            client_name: 'John Johnson',
            created_date: '2024-01-15T10:00:00Z',
            last_updated: '2024-01-20T14:30:00Z',
            due_date: '2024-04-15T23:59:59Z',
            completion_percentage: 65,
            estimated_refund: 2500,
        },
        {
            id: 'form-2',
            name: 'Smith Corp Tax Return',
            form_number: 'Form 1120',
            tax_year: 2024,
            category: 'business',
            status: 'review',
            client_id: 'client-2',
            client_name: 'Smith Corporation',
            created_date: '2024-01-10T09:00:00Z',
            last_updated: '2024-01-25T16:45:00Z',
            due_date: '2024-03-15T23:59:59Z',
            completion_percentage: 90,
            amount_owed: 15000,
        },
    ]

    // Filter forms
    const filteredForms = mockForms.filter((form) => {
        const matchesSearch =
            form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            form.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            form.form_number.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === 'all' || form.status === statusFilter
        const matchesCategory = categoryFilter === 'all' || form.category === categoryFilter

        return matchesSearch && matchesStatus && matchesCategory
    })

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    const getDaysUntilDue = (dueDateString: string) => {
        const dueDate = new Date(dueDateString)
        const today = new Date()
        const diffTime = dueDate.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }

    const FormCard = ({ form }: { form: TaxForm }) => {
        const StatusIcon = STATUS_ICONS[form.status]
        const daysUntilDue = form.due_date ? getDaysUntilDue(form.due_date) : null

        return (
            <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">{form.name}</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    {form.form_number} • {form.client_name}
                                </p>
                            </div>
                        </div>
                        <Badge className={STATUS_COLORS[form.status]}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {form.status.replace('_', ' ')}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{form.completion_percentage}%</span>
                        </div>
                        <Progress value={form.completion_percentage} className="h-2" />
                    </div>

                    {form.due_date && (
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span
                                className={daysUntilDue && daysUntilDue < 30 ? 'text-red-600' : 'text-muted-foreground'}
                            >
                                Due {formatDate(form.due_date)}
                                {daysUntilDue && (
                                    <span className="ml-1">
                                        ({daysUntilDue > 0 ? `${daysUntilDue} days left` : 'Overdue'})
                                    </span>
                                )}
                            </span>
                        </div>
                    )}

                    {form.estimated_refund && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                            <DollarSign className="h-4 w-4" />
                            <span>Estimated refund: ${form.estimated_refund.toLocaleString()}</span>
                        </div>
                    )}

                    {form.amount_owed && (
                        <div className="flex items-center gap-2 text-sm text-red-600">
                            <DollarSign className="h-4 w-4" />
                            <span>Amount owed: ${form.amount_owed.toLocaleString()}</span>
                        </div>
                    )}

                    <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedForm(form)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setSelectedForm(form)
                                setShowFormBuilder(true)
                            }}
                        >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Print className="h-4 w-4 mr-2" />
                                    Print
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Send className="h-4 w-4 mr-2" />
                                    E-file
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const TemplateCard = ({ template }: { template: FormTemplate }) => {
        return (
            <Card
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedTemplate(template)}
            >
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-50 rounded-lg">
                                <FileText className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">{template.name}</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    {template.form_number} • Tax Year {template.tax_year}
                                </p>
                            </div>
                        </div>
                        <Badge className={COMPLEXITY_COLORS[template.complexity]}>{template.complexity}</Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{template.description}</p>

                    <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{template.estimated_time}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span>{template.sections.length} sections</span>
                    </div>

                    <Button
                        className="w-full"
                        onClick={(e) => {
                            e.stopPropagation()
                            setSelectedTemplate(template)
                            setShowCreateDialog(true)
                        }}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Start New Form
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Tax Form Management</h1>
                <p className="text-gray-600 mt-1">Create, manage, and file tax forms with intelligent automation</p>
            </div>

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="forms">Active Forms</TabsTrigger>
                    <TabsTrigger value="templates">Form Templates</TabsTrigger>
                </TabsList>

                <TabsContent value="forms" className="space-y-6">
                    {/* Controls */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Search forms..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 w-80"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="review">Review</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="filed">Filed</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={categoryFilter} onValueChange={(value: any) => setCategoryFilter(value)}>
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        <SelectItem value="individual">Individual</SelectItem>
                                        <SelectItem value="business">Business</SelectItem>
                                        <SelectItem value="estate">Estate</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Button onClick={() => setActiveTab('templates')}>
                            <Plus className="h-4 w-4 mr-2" />
                            New Form
                        </Button>
                    </div>

                    {/* Forms List */}
                    {filteredForms.length === 0 ? (
                        <Card>
                            <CardContent className="text-center py-12">
                                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No forms found</h3>
                                <p className="text-gray-600 mb-4">
                                    {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                                        ? 'Try adjusting your filters or search terms.'
                                        : 'Create your first tax form to get started.'}
                                </p>
                                <Button onClick={() => setActiveTab('templates')}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create New Form
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredForms.map((form) => (
                                <FormCard key={form.id} form={form} />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="templates" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {FORM_TEMPLATES.map((template) => (
                            <TemplateCard key={template.id} template={template} />
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Create Form Dialog */}
            {selectedTemplate && (
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Create New {selectedTemplate.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="client">Select Client</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a client" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clients.map((client) => (
                                            <SelectItem key={client.id} value={client.id}>
                                                {client.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="tax_year">Tax Year</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select tax year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="2024">2024</SelectItem>
                                        <SelectItem value="2023">2023</SelectItem>
                                        <SelectItem value="2022">2022</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-2">Required Documents</h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    {selectedTemplate.required_documents.map((doc, index) => (
                                        <li key={index}>• {doc}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    setShowCreateDialog(false)
                                    setShowFormBuilder(true)
                                }}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create Form
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Form Builder Dialog */}
            {selectedTemplate && (
                <Dialog open={showFormBuilder} onOpenChange={setShowFormBuilder}>
                    <DialogContent className="max-w-4xl max-h-[80vh]">
                        <DialogHeader>
                            <DialogTitle>
                                {selectedTemplate.name} - {selectedTemplate.form_number}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-h-[60vh] overflow-hidden">
                            <div className="lg:col-span-1">
                                <Label className="text-sm font-medium">Form Sections</Label>
                                <ScrollArea className="h-96 mt-2">
                                    <div className="space-y-2">
                                        {selectedTemplate.sections.map((section) => (
                                            <div
                                                key={section.id}
                                                className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                                            >
                                                <h4 className="font-medium text-sm">{section.title}</h4>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {section.fields.length} fields
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                            <div className="lg:col-span-3">
                                <div className="space-y-6">
                                    {selectedTemplate.sections.map((section) => (
                                        <div key={section.id} className="space-y-4">
                                            <div>
                                                <h3 className="text-lg font-semibold">{section.title}</h3>
                                                <p className="text-sm text-muted-foreground">{section.description}</p>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {section.fields.map((field) => (
                                                    <div key={field.id}>
                                                        <Label htmlFor={field.id}>
                                                            {field.label}
                                                            {field.required && (
                                                                <span className="text-red-500 ml-1">*</span>
                                                            )}
                                                        </Label>
                                                        {field.type === 'text' && (
                                                            <Input
                                                                id={field.id}
                                                                value={formData[field.name] || ''}
                                                                onChange={(e) =>
                                                                    setFormData({
                                                                        ...formData,
                                                                        [field.name]: e.target.value,
                                                                    })
                                                                }
                                                            />
                                                        )}
                                                        {field.type === 'number' && (
                                                            <Input
                                                                id={field.id}
                                                                type="number"
                                                                value={formData[field.name] || ''}
                                                                onChange={(e) =>
                                                                    setFormData({
                                                                        ...formData,
                                                                        [field.name]: e.target.value,
                                                                    })
                                                                }
                                                            />
                                                        )}
                                                        {field.type === 'currency' && (
                                                            <div className="relative">
                                                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                                <Input
                                                                    id={field.id}
                                                                    type="number"
                                                                    step="0.01"
                                                                    className="pl-10"
                                                                    value={formData[field.name] || ''}
                                                                    onChange={(e) =>
                                                                        setFormData({
                                                                            ...formData,
                                                                            [field.name]: e.target.value,
                                                                        })
                                                                    }
                                                                />
                                                            </div>
                                                        )}
                                                        {field.type === 'date' && (
                                                            <Input
                                                                id={field.id}
                                                                type="date"
                                                                value={formData[field.name] || ''}
                                                                onChange={(e) =>
                                                                    setFormData({
                                                                        ...formData,
                                                                        [field.name]: e.target.value,
                                                                    })
                                                                }
                                                            />
                                                        )}
                                                        {field.type === 'select' && field.options && (
                                                            <Select
                                                                value={formData[field.name] || ''}
                                                                onValueChange={(value) =>
                                                                    setFormData({
                                                                        ...formData,
                                                                        [field.name]: value,
                                                                    })
                                                                }
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select..." />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {field.options.map((option) => (
                                                                        <SelectItem key={option} value={option}>
                                                                            {option}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            {section !==
                                                selectedTemplate.sections[selectedTemplate.sections.length - 1] && (
                                                <Separator />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={() => setShowFormBuilder(false)}>
                                Cancel
                            </Button>
                            <Button variant="outline">
                                <Save className="h-4 w-4 mr-2" />
                                Save Draft
                            </Button>
                            <Button>
                                <Zap className="h-4 w-4 mr-2" />
                                Auto-fill with AI
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}
