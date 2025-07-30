'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { 
    Mail, 
    Search, 
    Filter, 
    RefreshCw, 
    Archive, 
    Trash2, 
    Star, 
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    Settings,
    Send,
    Paperclip,
    Bot,
    User,
    Clock,
    AlertTriangle,
    CheckCircle,
    Calendar,
    Forward,
    Reply,
    ReplyAll,
    Loader2,
    FileText,
    DollarSign,
    Calendar as CalendarIcon,
    Brain,
    Eye,
    EyeOff,
    Zap,
    ThumbsUp,
    ThumbsDown,
    Edit,
    Play,
    Pause
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue 
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useAccessibility } from '@/hooks/use-accessibility'

import type { 
    Email, 
    EmailThread, 
    EmailFolder, 
    EmailFilter, 
    EmailSort, 
    EmailAnalysis,
    DraftEmail,
    EmailStats,
    UserPreferences 
} from '@/types/email'

// Sample data for demonstration
const SAMPLE_FOLDERS: EmailFolder[] = [
    { id: 'inbox', name: 'Inbox', type: 'inbox', unreadCount: 12, totalCount: 45, icon: 'Mail' },
    { id: 'sent', name: 'Sent', type: 'sent', unreadCount: 0, totalCount: 23, icon: 'Send' },
    { id: 'drafts', name: 'Drafts', type: 'drafts', unreadCount: 0, totalCount: 3, icon: 'Edit' },
    { id: 'archive', name: 'Archive', type: 'archive', unreadCount: 0, totalCount: 156, icon: 'Archive' },
    { id: 'tax-1040', name: 'Form 1040', type: 'custom', unreadCount: 3, totalCount: 18, color: 'blue' },
    { id: 'tax-business', name: 'Business Tax', type: 'custom', unreadCount: 2, totalCount: 12, color: 'green' },
    { id: 'urgent', name: 'Urgent', type: 'custom', unreadCount: 1, totalCount: 4, color: 'red' },
]

const SAMPLE_EMAILS: Email[] = [
    {
        id: '1',
        from: 'john.smith@email.com',
        fromName: 'John Smith',
        to: ['tax@yourfirm.com'],
        subject: 'Question about my 1040 form deadline',
        content: 'Hi, I need to know when my 2023 tax return is due. I heard there might be an extension available. My AGI last year was $85,000. Please let me know the deadline and if I need to file an extension.',
        date: new Date('2024-03-15T10:30:00'),
        isRead: false,
        isStarred: false,
        hasAttachments: false,
        attachments: [],
        priority: 'normal',
        folder: 'inbox',
        labels: ['client', 'deadline'],
        messageId: 'msg-1'
    },
    {
        id: '2',
        from: 'sarah.johnson@business.com',
        fromName: 'Sarah Johnson',
        to: ['tax@yourfirm.com'],
        subject: 'URGENT: IRS Notice received for business return',
        content: 'I received an IRS notice about my 2022 business tax return (Form 1120). They are saying there is a discrepancy of $15,000 in reported income. I need immediate assistance to respond to this notice. The response deadline is in 10 days.',
        date: new Date('2024-03-14T14:45:00'),
        isRead: false,
        isStarred: true,
        hasAttachments: true,
        attachments: [
            { id: 'att-1', filename: 'IRS_Notice.pdf', type: 'application/pdf', size: 245760 }
        ],
        priority: 'urgent',
        folder: 'inbox',
        labels: ['urgent', 'business', 'irs'],
        messageId: 'msg-2'
    },
    {
        id: '3',
        from: 'mike.davis@email.com',
        fromName: 'Mike Davis',
        to: ['tax@yourfirm.com'],
        subject: 'Schedule consultation for tax planning',
        content: 'I would like to schedule a consultation to discuss tax planning strategies for 2024. I am particularly interested in maximizing my retirement contributions and understanding the new tax laws. When would be a good time to meet?',
        date: new Date('2024-03-13T09:15:00'),
        isRead: true,
        isStarred: false,
        hasAttachments: false,
        attachments: [],
        priority: 'normal',
        folder: 'inbox',
        labels: ['consultation', 'planning'],
        messageId: 'msg-3'
    },
]

interface EmailAgentInterfaceProps {
    className?: string
}

export function EmailAgentInterface({ className }: EmailAgentInterfaceProps) {
    const { data: session, status } = useSession()
    
    // State management
    const [selectedFolder, setSelectedFolder] = useState<string>('inbox')
    const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
    const [emails, setEmails] = useState<Email[]>(SAMPLE_EMAILS)
    const [filteredEmails, setFilteredEmails] = useState<Email[]>(SAMPLE_EMAILS)
    const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set())
    const [isLoading, setIsLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [emailFilter, setEmailFilter] = useState<EmailFilter>({})
    const [emailSort, setEmailSort] = useState<EmailSort>({ field: 'date', direction: 'desc' })
    const [showFilters, setShowFilters] = useState(false)
    const [isComposing, setIsComposing] = useState(false)
    const [draft, setDraft] = useState<Partial<DraftEmail>>({})
    const [aiAnalyzing, setAiAnalyzing] = useState(false)
    const [emailAnalysis, setEmailAnalysis] = useState<EmailAnalysis | null>(null)
    const [showAiThinking, setShowAiThinking] = useState(false)
    const [aiResponse, setAiResponse] = useState('')
    const [awaitingApproval, setAwaitingApproval] = useState(false)
    const [compactView, setCompactView] = useState(false)

    // Refs
    const composeRef = useRef<HTMLTextAreaElement>(null)
    const searchRef = useRef<HTMLInputElement>(null)

    // Accessibility
    const { announce, manageFocus } = useAccessibility()

    // Filter and sort emails
    useEffect(() => {
        let filtered = emails.filter(email => {
            if (selectedFolder !== 'inbox' && email.folder !== selectedFolder) return false
            if (searchQuery && !email.subject.toLowerCase().includes(searchQuery.toLowerCase()) && 
                !email.content.toLowerCase().includes(searchQuery.toLowerCase()) &&
                !email.fromName.toLowerCase().includes(searchQuery.toLowerCase())) return false
            if (emailFilter.isRead !== undefined && email.isRead !== emailFilter.isRead) return false
            if (emailFilter.priority && email.priority !== emailFilter.priority) return false
            if (emailFilter.hasAttachments !== undefined && email.hasAttachments !== emailFilter.hasAttachments) return false
            return true
        })

        // Sort emails
        filtered.sort((a, b) => {
            const multiplier = emailSort.direction === 'asc' ? 1 : -1
            switch (emailSort.field) {
                case 'date':
                    return (a.date.getTime() - b.date.getTime()) * multiplier
                case 'from':
                    return a.fromName.localeCompare(b.fromName) * multiplier
                case 'subject':
                    return a.subject.localeCompare(b.subject) * multiplier
                case 'priority':
                    const priorityOrder = { low: 0, normal: 1, high: 2, urgent: 3 }
                    return (priorityOrder[a.priority] - priorityOrder[b.priority]) * multiplier
                default:
                    return 0
            }
        })

        setFilteredEmails(filtered)
    }, [emails, selectedFolder, searchQuery, emailFilter, emailSort])

    // Analyze email with AI
    const analyzeEmailWithAI = useCallback(async (email: Email) => {
        if (!email) return

        setAiAnalyzing(true)
        setShowAiThinking(true)
        announce('AI is analyzing the email', 'polite')

        try {
            const response = await fetch('/api/agents/email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    emailContent: email.content,
                    emailMetadata: {
                        from: email.from,
                        subject: email.subject,
                        date: email.date.toISOString(),
                        attachments: email.attachments
                    }
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to analyze email')
            }

            const analysisData = await response.json()
            setEmailAnalysis({
                triage: analysisData.triage,
                extractedData: analysisData.extractedData,
                suggestedActions: analysisData.suggestedActions
            })
            setAiResponse(analysisData.response)

            if (analysisData.triage.action === 'auto_respond' && analysisData.triage.confidence > 0.8) {
                setAwaitingApproval(true)
                announce('AI has generated a response and is awaiting approval', 'assertive')
            }

        } catch (error) {
            console.error('Error analyzing email:', error)
            toast.error('Failed to analyze email with AI')
        } finally {
            setAiAnalyzing(false)
            setShowAiThinking(false)
        }
    }, [announce])

    // Select email and analyze
    const selectEmail = useCallback((email: Email) => {
        setSelectedEmail(email)
        setEmailAnalysis(null)
        setAiResponse('')
        setAwaitingApproval(false)
        
        // Mark as read
        if (!email.isRead) {
            setEmails(prev => prev.map(e => 
                e.id === email.id ? { ...e, isRead: true } : e
            ))
        }

        // Auto-analyze with AI
        analyzeEmailWithAI(email)
    }, [analyzeEmailWithAI])

    // Handle email actions
    const handleEmailAction = useCallback((action: string, emailIds: string[] = []) => {
        const ids = emailIds.length > 0 ? emailIds : Array.from(selectedEmails)
        
        switch (action) {
            case 'archive':
                setEmails(prev => prev.map(email => 
                    ids.includes(email.id) ? { ...email, folder: 'archive' } : email
                ))
                announce(`${ids.length} email(s) archived`)
                break
            case 'delete':
                setEmails(prev => prev.filter(email => !ids.includes(email.id)))
                announce(`${ids.length} email(s) deleted`)
                break
            case 'mark_read':
                setEmails(prev => prev.map(email => 
                    ids.includes(email.id) ? { ...email, isRead: true } : email
                ))
                announce(`${ids.length} email(s) marked as read`)
                break
            case 'mark_unread':
                setEmails(prev => prev.map(email => 
                    ids.includes(email.id) ? { ...email, isRead: false } : email
                ))
                announce(`${ids.length} email(s) marked as unread`)
                break
            case 'star':
                setEmails(prev => prev.map(email => 
                    ids.includes(email.id) ? { ...email, isStarred: !email.isStarred } : email
                ))
                break
        }
        
        setSelectedEmails(new Set())
    }, [selectedEmails, announce])

    // Send AI response
    const sendAiResponse = useCallback(() => {
        if (!selectedEmail || !aiResponse) return

        // Simulate sending email
        toast.success('AI response sent successfully')
        setAwaitingApproval(false)
        setAiResponse('')
        announce('Email response sent')

        // Move to sent folder or mark as handled
        handleEmailAction('archive', [selectedEmail.id])
    }, [selectedEmail, aiResponse, handleEmailAction, announce])

    // Approve AI suggestion
    const approveAiSuggestion = useCallback(() => {
        sendAiResponse()
    }, [sendAiResponse])

    // Reject AI suggestion
    const rejectAiSuggestion = useCallback(() => {
        setAwaitingApproval(false)
        setAiResponse('')
        announce('AI suggestion rejected')
    }, [announce])

    // Get priority badge color
    const getPriorityColor = (priority: Email['priority']) => {
        switch (priority) {
            case 'urgent': return 'bg-red-500'
            case 'high': return 'bg-orange-500'
            case 'normal': return 'bg-blue-500'
            case 'low': return 'bg-gray-500'
            default: return 'bg-gray-500'
        }
    }

    // Get triage action color
    const getTriageColor = (action: string) => {
        switch (action) {
            case 'auto_respond': return 'text-green-600 bg-green-50'
            case 'needs_review': return 'text-yellow-600 bg-yellow-50'
            case 'schedule_meeting': return 'text-blue-600 bg-blue-50'
            case 'forward': return 'text-purple-600 bg-purple-50'
            default: return 'text-gray-600 bg-gray-50'
        }
    }

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading email interface...</span>
            </div>
        )
    }

    if (status === 'unauthenticated') {
        return (
            <Card className="max-w-2xl mx-auto">
                <CardContent className="pt-6">
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            Please sign in to access the Email Agent Interface.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        )
    }

    return (
        <div
            className={cn("h-screen flex flex-col bg-background", className)}
            role="main"
            aria-label="Email Agent Interface"
            id="main-content"
        >
            {/* Top Toolbar */}
            <div className="border-b bg-white px-4 py-3" role="toolbar" aria-label="Email toolbar">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-xl font-semibold">Email Agent</h1>
                        <Badge variant="secondary">
                            {filteredEmails.filter(e => !e.isRead).length} unread
                        </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCompactView(!compactView)}
                        >
                            {compactView ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </Button>
                        
                        <Button variant="outline" size="sm">
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Refresh
                        </Button>
                        
                        <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-1" />
                            Settings
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel - Email List */}
                <div className="w-1/3 border-r bg-white flex flex-col">
                    {/* Folders Sidebar */}
                    <div className="border-b">
                        <ScrollArea className="h-48">
                            <div className="p-3 space-y-1">
                                {SAMPLE_FOLDERS.map((folder) => (
                                    <Button
                                        key={folder.id}
                                        variant={selectedFolder === folder.id ? "secondary" : "ghost"}
                                        className="w-full justify-start h-8"
                                        onClick={() => setSelectedFolder(folder.id)}
                                    >
                                        <Mail className="h-4 w-4 mr-2" />
                                        <span className="flex-1 text-left">{folder.name}</span>
                                        {folder.unreadCount > 0 && (
                                            <Badge variant="secondary" className="ml-auto text-xs">
                                                {folder.unreadCount}
                                            </Badge>
                                        )}
                                    </Button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Search and Filters */}
                    <div className="p-3 border-b space-y-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                ref={searchRef}
                                placeholder="Search emails..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                                aria-label="Search emails"
                            />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Filter className="h-4 w-4 mr-1" />
                                Filters
                            </Button>
                            
                            <Select
                                value={`${emailSort.field}-${emailSort.direction}`}
                                onValueChange={(value) => {
                                    const [field, direction] = value.split('-')
                                    setEmailSort({ field: field as any, direction: direction as any })
                                }}
                            >
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="date-desc">Newest</SelectItem>
                                    <SelectItem value="date-asc">Oldest</SelectItem>
                                    <SelectItem value="from-asc">Sender A-Z</SelectItem>
                                    <SelectItem value="subject-asc">Subject A-Z</SelectItem>
                                    <SelectItem value="priority-desc">Priority</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {showFilters && (
                            <div className="space-y-2 p-2 bg-gray-50 rounded border">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="unread-only"
                                        checked={emailFilter.isRead === false}
                                        onCheckedChange={(checked) => 
                                            setEmailFilter(prev => ({ 
                                                ...prev, 
                                                isRead: checked ? false : undefined 
                                            }))
                                        }
                                    />
                                    <label htmlFor="unread-only" className="text-sm">Unread only</label>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="has-attachments"
                                        checked={emailFilter.hasAttachments === true}
                                        onCheckedChange={(checked) => 
                                            setEmailFilter(prev => ({ 
                                                ...prev, 
                                                hasAttachments: checked ? true : undefined 
                                            }))
                                        }
                                    />
                                    <label htmlFor="has-attachments" className="text-sm">Has attachments</label>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Email List */}
                    <ScrollArea className="flex-1">
                        <div className="divide-y">
                            {filteredEmails.map((email) => (
                                <div
                                    key={email.id}
                                    className={cn(
                                        "p-3 cursor-pointer hover:bg-gray-50 transition-colors",
                                        selectedEmail?.id === email.id && "bg-blue-50 border-r-2 border-blue-500",
                                        !email.isRead && "bg-blue-25 font-medium",
                                        compactView && "p-2"
                                    )}
                                    onClick={() => selectEmail(email)}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`Email from ${email.fromName}: ${email.subject}`}
                                >
                                    <div className="flex items-start space-x-3">
                                        <Checkbox
                                            checked={selectedEmails.has(email.id)}
                                            onCheckedChange={(checked) => {
                                                const newSelected = new Set(selectedEmails)
                                                if (checked) {
                                                    newSelected.add(email.id)
                                                } else {
                                                    newSelected.delete(email.id)
                                                }
                                                setSelectedEmails(newSelected)
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center space-x-2">
                                                    <span className={cn(
                                                        "text-sm truncate",
                                                        !email.isRead && "font-semibold"
                                                    )}>
                                                        {email.fromName}
                                                    </span>
                                                    {email.isStarred && (
                                                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                                    )}
                                                </div>
                                                
                                                <div className="flex items-center space-x-1">
                                                    <div className={cn(
                                                        "w-2 h-2 rounded-full",
                                                        getPriorityColor(email.priority)
                                                    )} />
                                                    <span className="text-xs text-muted-foreground">
                                                        {email.date.toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className={cn(
                                                "text-sm mb-1 truncate",
                                                !email.isRead ? "font-medium" : "text-muted-foreground"
                                            )}>
                                                {email.subject}
                                            </div>
                                            
                                            {!compactView && (
                                                <div className="text-xs text-muted-foreground truncate">
                                                    {email.content.substring(0, 100)}...
                                                </div>
                                            )}
                                            
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex space-x-1">
                                                    {email.labels.map(label => (
                                                        <Badge key={label} variant="outline" className="text-xs">
                                                            {label}
                                                        </Badge>
                                                    ))}
                                                </div>
                                                
                                                {email.hasAttachments && (
                                                    <Paperclip className="h-3 w-3 text-muted-foreground" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    {/* Email Actions */}
                    {selectedEmails.size > 0 && (
                        <div className="border-t p-3">
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEmailAction('archive')}
                                >
                                    <Archive className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEmailAction('delete')}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEmailAction('mark_read')}
                                >
                                    Mark Read
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    {selectedEmails.size} selected
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel - Email Detail/Conversation */}
                <div className="flex-1 flex flex-col bg-white">
                    {selectedEmail ? (
                        <>
                            {/* Email Header */}
                            <div className="border-b p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h2 className="text-lg font-semibold mb-1">{selectedEmail.subject}</h2>
                                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                            <span>From: {selectedEmail.fromName} &lt;{selectedEmail.from}&gt;</span>
                                            <span>•</span>
                                            <span>{selectedEmail.date.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                        <Badge className={getPriorityColor(selectedEmail.priority)}>
                                            {selectedEmail.priority}
                                        </Badge>
                                        
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="sm">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={() => handleEmailAction('archive', [selectedEmail.id])}>
                                                    <Archive className="h-4 w-4 mr-2" />
                                                    Archive
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleEmailAction('star', [selectedEmail.id])}>
                                                    <Star className="h-4 w-4 mr-2" />
                                                    {selectedEmail.isStarred ? 'Unstar' : 'Star'}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleEmailAction('delete', [selectedEmail.id])}>
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                {/* AI Analysis Status */}
                                {(aiAnalyzing || showAiThinking) && (
                                    <Alert className="mb-3">
                                        <Brain className="h-4 w-4 animate-pulse" />
                                        <AlertDescription className="flex items-center">
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            AI is analyzing this email for tax-related content...
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {emailAnalysis && (
                                    <div className="space-y-3">
                                        {/* Triage Decision */}
                                        <Alert>
                                            <Zap className="h-4 w-4" />
                                            <AlertDescription>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <Badge className={getTriageColor(emailAnalysis.triage.action)}>
                                                            {emailAnalysis.triage.action.replace('_', ' ')}
                                                        </Badge>
                                                        <span className="ml-2 text-sm">
                                                            Confidence: {Math.round(emailAnalysis.triage.confidence * 100)}%
                                                        </span>
                                                    </div>
                                                    <Progress 
                                                        value={emailAnalysis.triage.confidence * 100} 
                                                        className="w-24 h-2"
                                                    />
                                                </div>
                                                <p className="text-sm mt-2">{emailAnalysis.triage.reasoning}</p>
                                            </AlertDescription>
                                        </Alert>

                                        {/* Extracted Tax Data */}
                                        {emailAnalysis.extractedData && (
                                            <Card>
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-sm">Extracted Tax Information</CardTitle>
                                                </CardHeader>
                                                <CardContent className="pt-0">
                                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                                        {emailAnalysis.extractedData.formType && (
                                                            <div className="flex items-center">
                                                                <FileText className="h-4 w-4 mr-2 text-blue-500" />
                                                                <span>Form: {emailAnalysis.extractedData.formType}</span>
                                                            </div>
                                                        )}
                                                        {emailAnalysis.extractedData.taxYear && (
                                                            <div className="flex items-center">
                                                                <CalendarIcon className="h-4 w-4 mr-2 text-green-500" />
                                                                <span>Year: {emailAnalysis.extractedData.taxYear}</span>
                                                            </div>
                                                        )}
                                                        {emailAnalysis.extractedData.amounts && Object.keys(emailAnalysis.extractedData.amounts).map(key => (
                                                            <div key={key} className="flex items-center">
                                                                <DollarSign className="h-4 w-4 mr-2 text-yellow-500" />
                                                                <span>{key}: ${emailAnalysis.extractedData!.amounts![key].toLocaleString()}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Suggested Actions */}
                                        {emailAnalysis.suggestedActions && emailAnalysis.suggestedActions.length > 0 && (
                                            <Card>
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-sm">Suggested Actions</CardTitle>
                                                </CardHeader>
                                                <CardContent className="pt-0">
                                                    <div className="space-y-2">
                                                        {emailAnalysis.suggestedActions.map((action, index) => (
                                                            <div key={index} className="flex items-center justify-between text-sm">
                                                                <span>{action.description}</span>
                                                                <Button variant="outline" size="sm">
                                                                    Execute
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Email Content */}
                            <ScrollArea className="flex-1 p-4">
                                <div className="prose max-w-none">
                                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                        {selectedEmail.content}
                                    </div>
                                    
                                    {selectedEmail.attachments.length > 0 && (
                                        <div className="mt-4 p-3 bg-gray-50 rounded">
                                            <h4 className="text-sm font-medium mb-2">Attachments</h4>
                                            {selectedEmail.attachments.map(attachment => (
                                                <div key={attachment.id} className="flex items-center space-x-2 text-sm">
                                                    <Paperclip className="h-4 w-4" />
                                                    <span>{attachment.filename}</span>
                                                    <span className="text-muted-foreground">
                                                        ({(attachment.size / 1024).toFixed(1)} KB)
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>

                            {/* AI Response Section */}
                            {aiResponse && (
                                <div className="border-t bg-blue-50 p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-2">
                                            <Bot className="h-5 w-5 text-blue-600" />
                                            <span className="font-medium text-blue-900">AI Generated Response</span>
                                        </div>
                                        
                                        {awaitingApproval && (
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={rejectAiSuggestion}
                                                >
                                                    <ThumbsDown className="h-4 w-4 mr-1" />
                                                    Reject
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={approveAiSuggestion}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    <ThumbsUp className="h-4 w-4 mr-1" />
                                                    Approve & Send
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="bg-white p-3 rounded border">
                                        <div className="whitespace-pre-wrap text-sm">
                                            {aiResponse}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Reply Actions */}
                            <div className="border-t p-4">
                                <div className="flex items-center space-x-2">
                                    <Button>
                                        <Reply className="h-4 w-4 mr-2" />
                                        Reply
                                    </Button>
                                    <Button variant="outline">
                                        <ReplyAll className="h-4 w-4 mr-2" />
                                        Reply All
                                    </Button>
                                    <Button variant="outline">
                                        <Forward className="h-4 w-4 mr-2" />
                                        Forward
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                                <Mail className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-medium mb-2">Select an email to view</h3>
                                <p>Choose an email from the list to see its content and AI analysis</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
