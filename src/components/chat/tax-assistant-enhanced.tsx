'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useParams } from 'next/navigation'
import {
    Send,
    Bot,
    User,
    FileText,
    Paperclip,
    Download,
    Copy,
    ThumbsUp,
    ThumbsDown,
    RefreshCw,
    AlertCircle,
    Zap,
    Calculator,
    BookOpen,
    MessageSquare,
    Clock,
    CheckCircle2,
    Plus,
    X,
    Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import {
    useTaxAssistantSessions,
    useCreateTaxAssistantSession,
    useInvokeAgent,
    useCreditUsage,
    useWorkspaceClients,
    useClientDocuments,
} from '@/lib/hooks/api-hooks'
import ReactMarkdown from 'react-markdown'
import { toast } from 'sonner'

interface ChatMessage {
    id: string
    content: string
    role: 'user' | 'assistant'
    timestamp: string
    metadata?: {
        credits_used?: number
        response_time?: number
        documents_referenced?: string[]
        calculations?: any[]
    }
}

interface TaxSession {
    id: string
    name: string
    client_id?: string
    client_name?: string
    created_date: string
    last_activity: string
    message_count: number
    status: 'active' | 'completed' | 'archived'
}

const QUICK_PROMPTS = [
    {
        category: 'Tax Calculation',
        prompts: [
            'Calculate estimated quarterly taxes for this client',
            'What are the current tax brackets for 2024?',
            'Help me calculate depreciation for business equipment',
            'Estimate tax liability for capital gains',
        ],
    },
    {
        category: 'Deductions',
        prompts: [
            'What business expenses are deductible?',
            'Calculate home office deduction',
            'Review meal and entertainment deductions',
            'List available tax credits for this client',
        ],
    },
    {
        category: 'Form Help',
        prompts: [
            'Help me complete Schedule C',
            'Explain Form 1120 requirements',
            'Walk through Form 1065 partnership return',
            'What forms does this client need?',
        ],
    },
]

export function TaxAssistantEnhanced() {
    const params = useParams<{ workspaceId: string }>()
    const workspaceId = params.workspaceId
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // State management
    const [activeSession, setActiveSession] = useState<TaxSession | null>(null)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [inputMessage, setInputMessage] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [selectedClient, setSelectedClient] = useState<string>('')
    const [attachedDocuments, setAttachedDocuments] = useState<string[]>([])
    const [showNewSessionDialog, setShowNewSessionDialog] = useState(false)
    const [sessionName, setSessionName] = useState('')
    const [showQuickPrompts, setShowQuickPrompts] = useState(true)

    // API hooks
    const { data: sessions, isLoading: sessionsLoading } = useTaxAssistantSessions(workspaceId)
    const { data: clients } = useWorkspaceClients(workspaceId)
    const { data: clientDocuments } = useClientDocuments(selectedClient)
    const { data: creditUsage } = useCreditUsage(workspaceId)
    const createSessionMutation = useCreateTaxAssistantSession(workspaceId)
    const invokeAgentMutation = useInvokeAgent(workspaceId)

    // Mock messages for demo
    useEffect(() => {
        if (activeSession && messages.length === 0) {
            setMessages([
                {
                    id: '1',
                    content: `Hello! I'm your Tax Assistant. I'm here to help you with tax calculations, form completion, deduction analysis, and general tax questions${selectedClient ? ' for your selected client' : ''}. How can I assist you today?`,
                    role: 'assistant',
                    timestamp: new Date().toISOString(),
                },
            ])
        }
    }, [activeSession, selectedClient])

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || !activeSession || invokeAgentMutation.isPending) return

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            content: inputMessage,
            role: 'user',
            timestamp: new Date().toISOString(),
        }

        setMessages((prev) => [...prev, userMessage])
        setInputMessage('')
        setIsTyping(true)
        setShowQuickPrompts(false)

        try {
            // Prepare context for AI
            const context = {
                session_id: activeSession.id,
                client_id: selectedClient && selectedClient !== 'none' ? selectedClient : null,
                attached_documents: attachedDocuments,
                workspace_id: workspaceId,
                conversation_history: messages.slice(-5), // Last 5 messages for context
            }

            const response = await invokeAgentMutation.mutateAsync({
                prompt: inputMessage,
                context,
            })

            if (response.success && response.data) {
                const assistantMessage: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    content: response.data.response,
                    role: 'assistant',
                    timestamp: new Date().toISOString(),
                    metadata: {
                        credits_used: response.data.credits_used,
                        response_time: 1200, // Mock response time
                        documents_referenced: attachedDocuments,
                    },
                }

                setMessages((prev) => [...prev, assistantMessage])
            }
        } catch (error) {
            console.error('Failed to send message:', error)
            toast.error('Failed to get AI response. Please try again.')
        } finally {
            setIsTyping(false)
        }
    }

    const handleCreateSession = async () => {
        if (!sessionName.trim()) return

        try {
            const sessionData = {
                name: sessionName,
                client_id: selectedClient && selectedClient !== 'none' ? selectedClient : null,
                workspace_id: workspaceId,
            }

            const result = await createSessionMutation.mutateAsync(sessionData)
            if (result.success) {
                setShowNewSessionDialog(false)
                setSessionName('')
                // Would refresh sessions list in real implementation
                toast.success('New session created successfully')
            }
        } catch (error) {
            console.error('Failed to create session:', error)
        }
    }

    const handleQuickPrompt = (prompt: string) => {
        setInputMessage(prompt)
        setShowQuickPrompts(false)
    }

    const copyMessage = (content: string) => {
        navigator.clipboard.writeText(content)
        toast.success('Message copied to clipboard')
    }

    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    // Mock sessions for demo
    const mockSessions: TaxSession[] = sessions || [
        {
            id: 'session-1',
            name: 'Q4 Tax Planning',
            client_id: 'client-1',
            client_name: 'John Johnson',
            created_date: '2024-01-15T10:00:00Z',
            last_activity: '2024-01-20T14:30:00Z',
            message_count: 12,
            status: 'active',
        },
        {
            id: 'session-2',
            name: 'Corporation Tax Questions',
            client_id: 'client-2',
            client_name: 'Smith Corporation',
            created_date: '2024-01-10T09:00:00Z',
            last_activity: '2024-01-18T16:45:00Z',
            message_count: 8,
            status: 'active',
        },
    ]

    return (
        <div className="h-full flex">
            {/* Sidebar - Sessions */}
            <div className="w-80 border-r bg-gray-50 flex flex-col">
                <div className="p-4 border-b">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Tax Assistant</h2>
                        <Button size="sm" onClick={() => setShowNewSessionDialog(true)}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Client Selector */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Active Client</Label>
                        <Select value={selectedClient} onValueChange={setSelectedClient}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select client (optional)" />
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

                    {/* Credit Usage */}
                    {creditUsage && (
                        <div className="mt-4 p-3 bg-white rounded-lg">
                            <div className="flex justify-between text-sm mb-1">
                                <span>AI Credits</span>
                                <span>
                                    {creditUsage.used} / {creditUsage.limit}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${(creditUsage.used / creditUsage.limit) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Sessions List */}
                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-2">
                        {mockSessions.map((session) => (
                            <Card
                                key={session.id}
                                className={`cursor-pointer transition-colors ${
                                    activeSession?.id === session.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                                }`}
                                onClick={() => setActiveSession(session)}
                            >
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-sm truncate">{session.name}</h4>
                                            {session.client_name && (
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {session.client_name}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                                <MessageSquare className="h-3 w-3" />
                                                <span>{session.message_count} messages</span>
                                            </div>
                                        </div>
                                        <Badge
                                            variant={session.status === 'active' ? 'default' : 'secondary'}
                                            className="text-xs"
                                        >
                                            {session.status}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {activeSession ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b bg-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold">{activeSession.name}</h3>
                                    {activeSession.client_name && (
                                        <p className="text-sm text-muted-foreground">
                                            Client: {activeSession.client_name}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {attachedDocuments.length > 0 && (
                                        <Badge variant="outline">
                                            <Paperclip className="h-3 w-3 mr-1" />
                                            {attachedDocuments.length} docs
                                        </Badge>
                                    )}
                                    <Button variant="outline" size="sm">
                                        <Download className="h-4 w-4 mr-1" />
                                        Export
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4 max-w-4xl mx-auto">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex gap-3 ${
                                            message.role === 'user' ? 'justify-end' : 'justify-start'
                                        }`}
                                    >
                                        {message.role === 'assistant' && (
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                <Bot className="h-4 w-4 text-blue-600" />
                                            </div>
                                        )}

                                        <div
                                            className={`max-w-2xl rounded-lg p-4 ${
                                                message.role === 'user'
                                                    ? 'bg-blue-600 text-white ml-12'
                                                    : 'bg-gray-100 text-gray-900 mr-12'
                                            }`}
                                        >
                                            <div className="prose prose-sm max-w-none">
                                                {message.role === 'assistant' ? (
                                                    <ReactMarkdown>{message.content}</ReactMarkdown>
                                                ) : (
                                                    <p>{message.content}</p>
                                                )}
                                            </div>

                                            <div
                                                className={`flex items-center justify-between mt-3 pt-2 border-t ${
                                                    message.role === 'user' ? 'border-blue-500' : 'border-gray-200'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2 text-xs opacity-70">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{formatTimestamp(message.timestamp)}</span>
                                                    {message.metadata?.credits_used && (
                                                        <>
                                                            <Separator orientation="vertical" className="h-3" />
                                                            <Zap className="h-3 w-3" />
                                                            <span>{message.metadata.credits_used} credits</span>
                                                        </>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                                                        onClick={() => copyMessage(message.content)}
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                    </Button>
                                                    {message.role === 'assistant' && (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                                                            >
                                                                <ThumbsUp className="h-3 w-3" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                                                            >
                                                                <ThumbsDown className="h-3 w-3" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {message.role === 'user' && (
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                                <User className="h-4 w-4 text-gray-600" />
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {isTyping && (
                                    <div className="flex gap-3 justify-start">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                            <Bot className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div className="bg-gray-100 rounded-lg p-4 mr-12">
                                            <div className="flex items-center gap-1">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                                <div
                                                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                                    style={{ animationDelay: '0.1s' }}
                                                />
                                                <div
                                                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                                    style={{ animationDelay: '0.2s' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>
                        </ScrollArea>

                        {/* Quick Prompts */}
                        {showQuickPrompts && messages.length <= 1 && (
                            <div className="p-4 border-t bg-gray-50">
                                <div className="max-w-4xl mx-auto">
                                    <h4 className="text-sm font-medium mb-3">Quick Prompts</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {QUICK_PROMPTS.map((category) => (
                                            <div key={category.category}>
                                                <h5 className="text-xs font-medium text-muted-foreground mb-2">
                                                    {category.category}
                                                </h5>
                                                <div className="space-y-1">
                                                    {category.prompts.map((prompt, index) => (
                                                        <Button
                                                            key={index}
                                                            variant="outline"
                                                            size="sm"
                                                            className="w-full text-left h-auto p-2 text-xs justify-start"
                                                            onClick={() => handleQuickPrompt(prompt)}
                                                        >
                                                            {prompt}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="p-4 border-t bg-white">
                            <div className="max-w-4xl mx-auto">
                                {attachedDocuments.length > 0 && (
                                    <div className="mb-3 flex flex-wrap gap-2">
                                        {attachedDocuments.map((docId) => (
                                            <Badge key={docId} variant="outline" className="flex items-center gap-1">
                                                <FileText className="h-3 w-3" />
                                                Document {docId}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-4 w-4 p-0 ml-1"
                                                    onClick={() =>
                                                        setAttachedDocuments((prev) =>
                                                            prev.filter((id) => id !== docId)
                                                        )
                                                    }
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <div className="flex-1 relative">
                                        <Textarea
                                            value={inputMessage}
                                            onChange={(e) => setInputMessage(e.target.value)}
                                            placeholder="Ask me about tax calculations, forms, deductions, or any tax-related questions..."
                                            className="resize-none pr-12"
                                            rows={1}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault()
                                                    handleSendMessage()
                                                }
                                            }}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-2 bottom-2 h-6 w-6 p-0"
                                            disabled={selectedClient === '' || !clientDocuments?.documents?.length}
                                        >
                                            <Paperclip className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <Button
                                        onClick={handleSendMessage}
                                        disabled={!inputMessage.trim() || invokeAgentMutation.isPending}
                                    >
                                        {invokeAgentMutation.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Send className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tax Assistant</h3>
                            <p className="text-gray-600 mb-4">
                                Select a session to start chatting with your AI tax assistant
                            </p>
                            <Button onClick={() => setShowNewSessionDialog(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Start New Session
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* New Session Dialog */}
            <Dialog open={showNewSessionDialog} onOpenChange={setShowNewSessionDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Start New Tax Session</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="session_name">Session Name</Label>
                            <Input
                                id="session_name"
                                value={sessionName}
                                onChange={(e) => setSessionName(e.target.value)}
                                placeholder="e.g., Q4 Tax Planning, Form 1040 Help"
                            />
                        </div>
                        <div>
                            <Label htmlFor="client_select">Client (Optional)</Label>
                            <Select value={selectedClient} onValueChange={setSelectedClient}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a client for context" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">General tax questions</SelectItem>
                                    {clients?.clients?.map((client) => (
                                        <SelectItem key={client.id} value={client.id}>
                                            {client.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNewSessionDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateSession}
                            disabled={!sessionName.trim() || createSessionMutation.isPending}
                        >
                            {createSessionMutation.isPending ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Plus className="h-4 w-4 mr-2" />
                            )}
                            Start Session
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
