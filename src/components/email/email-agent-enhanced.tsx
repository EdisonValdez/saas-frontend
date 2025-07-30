'use client'

import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import {
    Mail,
    Send,
    Save,
    FileText,
    Paperclip,
    Eye,
    Edit,
    Copy,
    MoreHorizontal,
    Plus,
    X,
    Users,
    Calendar,
    Clock,
    Zap,
    RefreshCw,
    Download,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Bot,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
    useEmailAgentSessions,
    useCreateEmailAgentSession,
    useInvokeAgent,
    useCreditUsage,
    useWorkspaceClients,
    useClientDocuments,
} from '@/lib/hooks/api-hooks'
import { toast } from 'sonner'

interface EmailTemplate {
    id: string
    name: string
    category: 'client_communication' | 'follow_up' | 'document_request' | 'deadline_reminder' | 'tax_advice'
    subject: string
    body: string
    variables: string[]
    description: string
}

interface EmailSession {
    id: string
    name: string
    client_id?: string
    client_name?: string
    template_used?: string
    status: 'draft' | 'sent' | 'scheduled'
    created_date: string
    sent_date?: string
}

interface EmailDraft {
    to: string[]
    cc?: string[]
    bcc?: string[]
    subject: string
    body: string
    attachments: string[]
    template_id?: string
    client_id?: string
}

const EMAIL_TEMPLATES: EmailTemplate[] = [
    {
        id: 'welcome_client',
        name: 'Welcome New Client',
        category: 'client_communication',
        subject: "Welcome to [FIRM_NAME] - Let's Get Started!",
        body: `Dear [CLIENT_NAME],

Welcome to [FIRM_NAME]! We're excited to work with you on your tax needs for [TAX_YEAR].

To get started, please provide the following documents:
- W-2 forms from all employers
- 1099 forms (if applicable)
- Bank statements
- Investment statements
- Receipts for deductible expenses

You can upload these documents securely through our client portal or bring them to your appointment.

If you have any questions, please don't hesitate to reach out.

Best regards,
[YOUR_NAME]
[FIRM_NAME]`,
        variables: ['CLIENT_NAME', 'FIRM_NAME', 'TAX_YEAR', 'YOUR_NAME'],
        description: 'Welcome message for new clients with document checklist',
    },
    {
        id: 'document_request',
        name: 'Document Request Follow-up',
        category: 'document_request',
        subject: 'Document Request - [CLIENT_NAME]',
        body: `Dear [CLIENT_NAME],

I hope this email finds you well. I'm following up on the documents we discussed for your [TAX_YEAR] tax return.

We're still waiting for:
[MISSING_DOCUMENTS]

To ensure we can complete your return by the deadline, please send these documents by [DUE_DATE].

You can:
- Upload them to our secure client portal
- Email them to this address
- Drop them off at our office

If you have any questions about what's needed, please let me know.

Thank you for your prompt attention to this matter.

Best regards,
[YOUR_NAME]`,
        variables: ['CLIENT_NAME', 'TAX_YEAR', 'MISSING_DOCUMENTS', 'DUE_DATE', 'YOUR_NAME'],
        description: 'Follow-up email for missing documents',
    },
    {
        id: 'deadline_reminder',
        name: 'Tax Deadline Reminder',
        category: 'deadline_reminder',
        subject: 'Important: Tax Filing Deadline Approaching',
        body: `Dear [CLIENT_NAME],

This is a friendly reminder that the tax filing deadline for [TAX_YEAR] is approaching on [DEADLINE_DATE].

Current status of your return:
- Completion: [COMPLETION_PERCENTAGE]%
- Estimated refund/owed: [TAX_AMOUNT]

To ensure timely filing, please:
[ACTION_ITEMS]

If you need an extension, please let us know immediately so we can file the necessary paperwork.

Feel free to contact me with any questions.

Best regards,
[YOUR_NAME]`,
        variables: [
            'CLIENT_NAME',
            'TAX_YEAR',
            'DEADLINE_DATE',
            'COMPLETION_PERCENTAGE',
            'TAX_AMOUNT',
            'ACTION_ITEMS',
            'YOUR_NAME',
        ],
        description: 'Reminder for upcoming tax deadlines',
    },
    {
        id: 'tax_advice',
        name: 'Tax Planning Advice',
        category: 'tax_advice',
        subject: 'Tax Planning Opportunities for [CLIENT_NAME]',
        body: `Dear [CLIENT_NAME],

Based on our review of your [TAX_YEAR] tax situation, I wanted to share some planning opportunities for the upcoming year:

Key Recommendations:
[RECOMMENDATIONS]

Potential Tax Savings:
[SAVINGS_OPPORTUNITIES]

These strategies could help reduce your tax liability and improve your financial position. I'd be happy to discuss these recommendations in detail.

Would you like to schedule a consultation to review these opportunities?

Best regards,
[YOUR_NAME]`,
        variables: ['CLIENT_NAME', 'TAX_YEAR', 'RECOMMENDATIONS', 'SAVINGS_OPPORTUNITIES', 'YOUR_NAME'],
        description: 'Proactive tax planning advice for clients',
    },
]

const AI_SUGGESTIONS = [
    'Make this email more professional',
    'Add urgency to the message',
    'Make it more friendly and approachable',
    'Simplify the language',
    'Add a call-to-action',
    'Include deadline information',
    'Add tax law references',
    'Make it more personalized',
]

export function EmailAgentEnhanced() {
    const params = useParams<{ workspaceId: string }>()
    const workspaceId = params.workspaceId

    // State management
    const [activeTab, setActiveTab] = useState('compose')
    const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
    const [emailDraft, setEmailDraft] = useState<EmailDraft>({
        to: [],
        subject: '',
        body: '',
        attachments: [],
    })
    const [newRecipient, setNewRecipient] = useState('')
    const [showTemplateDialog, setShowTemplateDialog] = useState(false)
    const [showAISuggestions, setShowAISuggestions] = useState(false)
    const [isGeneratingAI, setIsGeneratingAI] = useState(false)
    const [selectedClient, setSelectedClient] = useState('')

    // API hooks
    const { data: sessions } = useEmailAgentSessions(workspaceId)
    const { data: clients } = useWorkspaceClients(workspaceId)
    const { data: clientDocuments } = useClientDocuments(selectedClient)
    const { data: creditUsage } = useCreditUsage(workspaceId)
    const createSessionMutation = useCreateEmailAgentSession(workspaceId)
    const invokeAgentMutation = useInvokeAgent(workspaceId)

    // Mock sessions for demo
    const mockSessions: EmailSession[] = sessions || [
        {
            id: 'email-1',
            name: 'Welcome Email - Johnson',
            client_id: 'client-1',
            client_name: 'John Johnson',
            template_used: 'welcome_client',
            status: 'sent',
            created_date: '2024-01-15T10:00:00Z',
            sent_date: '2024-01-15T10:30:00Z',
        },
        {
            id: 'email-2',
            name: 'Document Request - Smith Corp',
            client_id: 'client-2',
            client_name: 'Smith Corporation',
            template_used: 'document_request',
            status: 'draft',
            created_date: '2024-01-20T14:30:00Z',
        },
    ]

    const handleTemplateSelect = (template: EmailTemplate) => {
        setSelectedTemplate(template)
        setEmailDraft((prev) => ({
            ...prev,
            subject: template.subject,
            body: template.body,
            template_id: template.id,
        }))
        setShowTemplateDialog(false)
    }

    const handleAddRecipient = () => {
        if (newRecipient.trim() && !emailDraft.to.includes(newRecipient)) {
            setEmailDraft((prev) => ({
                ...prev,
                to: [...prev.to, newRecipient.trim()],
            }))
            setNewRecipient('')
        }
    }

    const handleRemoveRecipient = (email: string) => {
        setEmailDraft((prev) => ({
            ...prev,
            to: prev.to.filter((e) => e !== email),
        }))
    }

    const handleAISuggestion = async (suggestion: string) => {
        if (!emailDraft.body.trim()) {
            toast.error('Please enter some email content first')
            return
        }

        setIsGeneratingAI(true)
        try {
            const prompt = `${suggestion}: "${emailDraft.body}"`
            const response = await invokeAgentMutation.mutateAsync({
                prompt,
                context: {
                    task: 'email_enhancement',
                    client_id: selectedClient,
                    workspace_id: workspaceId,
                },
            })

            if (response.success && response.data) {
                setEmailDraft((prev) => ({
                    ...prev,
                    body: response.data.response,
                }))
                toast.success('Email content enhanced with AI')
            }
        } catch (error) {
            toast.error('Failed to enhance email content')
        } finally {
            setIsGeneratingAI(false)
        }
    }

    const handleSendEmail = async () => {
        if (!emailDraft.to.length || !emailDraft.subject.trim() || !emailDraft.body.trim()) {
            toast.error('Please fill in all required fields')
            return
        }

        try {
            // In real implementation, this would call the email sending API
            toast.success('Email sent successfully!')

            // Reset form
            setEmailDraft({
                to: [],
                subject: '',
                body: '',
                attachments: [],
            })
        } catch (error) {
            toast.error('Failed to send email')
        }
    }

    const handleSaveDraft = async () => {
        try {
            // In real implementation, this would save to backend
            toast.success('Draft saved successfully!')
        } catch (error) {
            toast.error('Failed to save draft')
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const TemplateCard = ({ template }: { template: EmailTemplate }) => (
        <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleTemplateSelect(template)}
        >
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                    </div>
                    <Badge variant="outline">{template.category.replace('_', ' ')}</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <div>
                        <Label className="text-xs font-medium">Subject Line</Label>
                        <p className="text-sm text-muted-foreground">{template.subject}</p>
                    </div>
                    <div>
                        <Label className="text-xs font-medium">Variables</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {template.variables.slice(0, 3).map((variable) => (
                                <Badge key={variable} variant="secondary" className="text-xs">
                                    {variable}
                                </Badge>
                            ))}
                            {template.variables.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                    +{template.variables.length - 3} more
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    const SessionCard = ({ session }: { session: EmailSession }) => (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{session.name}</h4>
                    <Badge
                        variant={
                            session.status === 'sent' ? 'default' : session.status === 'draft' ? 'secondary' : 'outline'
                        }
                    >
                        {session.status}
                    </Badge>
                </div>
                {session.client_name && (
                    <p className="text-xs text-muted-foreground mb-2">Client: {session.client_name}</p>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatDate(session.created_date)}</span>
                    <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Edit className="h-3 w-3" />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <MoreHorizontal className="h-3 w-3" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Email Agent</h1>
                <p className="text-gray-600 mt-1">Create professional emails with AI assistance and templates</p>
            </div>

            {/* Credit Usage */}
            {creditUsage && (
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Zap className="h-4 w-4 text-purple-500" />
                                <span className="text-sm font-medium">AI Credits</span>
                            </div>
                            <div className="text-sm">
                                {creditUsage.used} / {creditUsage.limit} used
                            </div>
                        </div>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-purple-600 h-2 rounded-full"
                                style={{ width: `${(creditUsage.used / creditUsage.limit) * 100}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="compose">Compose</TabsTrigger>
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="compose" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Email Composition */}
                        <div className="lg:col-span-2 space-y-4">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Compose Email</CardTitle>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setShowTemplateDialog(true)}
                                            >
                                                <FileText className="h-4 w-4 mr-1" />
                                                Templates
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setShowAISuggestions(!showAISuggestions)}
                                            >
                                                <Bot className="h-4 w-4 mr-1" />
                                                AI Assist
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Client Selection */}
                                    <div>
                                        <Label htmlFor="client">Client (Optional)</Label>
                                        <Select value={selectedClient} onValueChange={setSelectedClient}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select client for context" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">No specific client</SelectItem>
                                                {clients?.clients?.map((client) => (
                                                    <SelectItem key={client.id} value={client.id}>
                                                        {client.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Recipients */}
                                    <div>
                                        <Label htmlFor="recipients">To</Label>
                                        <div className="space-y-2">
                                            {emailDraft.to.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {emailDraft.to.map((email) => (
                                                        <Badge
                                                            key={email}
                                                            variant="secondary"
                                                            className="flex items-center gap-1"
                                                        >
                                                            {email}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-4 w-4 p-0 ml-1"
                                                                onClick={() => handleRemoveRecipient(email)}
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </Button>
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex gap-2">
                                                <Input
                                                    value={newRecipient}
                                                    onChange={(e) => setNewRecipient(e.target.value)}
                                                    placeholder="Enter email address"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault()
                                                            handleAddRecipient()
                                                        }
                                                    }}
                                                />
                                                <Button type="button" onClick={handleAddRecipient}>
                                                    Add
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Subject */}
                                    <div>
                                        <Label htmlFor="subject">Subject</Label>
                                        <Input
                                            id="subject"
                                            value={emailDraft.subject}
                                            onChange={(e) =>
                                                setEmailDraft((prev) => ({ ...prev, subject: e.target.value }))
                                            }
                                            placeholder="Email subject"
                                        />
                                    </div>

                                    {/* Body */}
                                    <div>
                                        <Label htmlFor="body">Message</Label>
                                        <Textarea
                                            id="body"
                                            value={emailDraft.body}
                                            onChange={(e) =>
                                                setEmailDraft((prev) => ({ ...prev, body: e.target.value }))
                                            }
                                            placeholder="Type your message here..."
                                            rows={12}
                                            className="resize-none"
                                        />
                                    </div>

                                    {/* Attachments */}
                                    <div>
                                        <Label>Attachments</Label>
                                        <div className="border-2 border-dashed rounded-lg p-4 text-center text-muted-foreground">
                                            <Paperclip className="h-8 w-8 mx-auto mb-2" />
                                            <p>Drag & drop files here or click to browse</p>
                                            <p className="text-xs mt-1">Support for PDF, images, and documents</p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-4">
                                        <Button onClick={handleSendEmail} className="flex-1">
                                            <Send className="h-4 w-4 mr-2" />
                                            Send Email
                                        </Button>
                                        <Button variant="outline" onClick={handleSaveDraft}>
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Draft
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* AI Suggestions Panel */}
                        <div className="space-y-4">
                            {showAISuggestions && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Bot className="h-5 w-5" />
                                            AI Suggestions
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {AI_SUGGESTIONS.map((suggestion, index) => (
                                                <Button
                                                    key={index}
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full text-left justify-start h-auto p-2 text-xs"
                                                    onClick={() => handleAISuggestion(suggestion)}
                                                    disabled={isGeneratingAI || !emailDraft.body.trim()}
                                                >
                                                    {isGeneratingAI ? (
                                                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                                    ) : (
                                                        <Zap className="h-3 w-3 mr-1" />
                                                    )}
                                                    {suggestion}
                                                </Button>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Selected Template Info */}
                            {selectedTemplate && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">Using Template</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium">{selectedTemplate.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {selectedTemplate.description}
                                            </p>
                                            <div className="flex flex-wrap gap-1">
                                                {selectedTemplate.variables.map((variable) => (
                                                    <Badge key={variable} variant="secondary" className="text-xs">
                                                        {variable}
                                                    </Badge>
                                                ))}
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full mt-2"
                                                onClick={() => setSelectedTemplate(null)}
                                            >
                                                Clear Template
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="templates" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {EMAIL_TEMPLATES.map((template) => (
                            <TemplateCard key={template.id} template={template} />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="history" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mockSessions.map((session) => (
                            <SessionCard key={session.id} session={session} />
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Template Selection Dialog */}
            <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
                <DialogContent className="max-w-4xl max-h-[80vh]">
                    <DialogHeader>
                        <DialogTitle>Choose Email Template</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="max-h-[60vh]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                            {EMAIL_TEMPLATES.map((template) => (
                                <TemplateCard key={template.id} template={template} />
                            ))}
                        </div>
                    </ScrollArea>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
