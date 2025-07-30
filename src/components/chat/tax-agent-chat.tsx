'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { 
    Send, 
    Upload, 
    FileText, 
    Calendar, 
    Search, 
    Download, 
    Trash2, 
    AlertTriangle,
    Clock,
    CheckCircle,
    XCircle,
    Loader2,
    Paperclip,
    Bot,
    User,
    MoreVertical,
    Copy,
    ExternalLink
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
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useAccessibility } from '@/hooks/use-accessibility'

interface Message {
    id: string
    role: 'user' | 'agent'
    content: string
    timestamp: Date
    status?: 'sending' | 'sent' | 'error'
    attachments?: File[]
}

interface AgentRequest {
    prompt: string
}

interface AgentResponse {
    response: string
}

const QUICK_ACTIONS = [
    {
        id: 'upload-document',
        label: 'Upload Tax Document',
        icon: Upload,
        prompt: 'I need help uploading and analyzing a tax document',
        color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
        id: 'classify-form',
        label: 'Classify Form',
        icon: FileText,
        prompt: 'Help me classify my tax form type',
        color: 'bg-green-500 hover:bg-green-600',
    },
    {
        id: 'extract-data',
        label: 'Extract Form Data',
        icon: Search,
        prompt: 'Extract data from my tax document',
        color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
        id: 'understand-field',
        label: 'Understand Field',
        icon: FileText,
        prompt: 'Explain a tax form field to me',
        color: 'bg-orange-500 hover:bg-orange-600',
    },
    {
        id: 'filing-deadline',
        label: 'Filing Deadlines',
        icon: Calendar,
        prompt: 'Show me tax filing deadlines',
        color: 'bg-red-500 hover:bg-red-600',
    },
]

const SUGGESTED_PROMPTS = [
    "How do I classify my tax form?",
    "What are the 2024 tax filing deadlines?",
    "Help me understand Form 1040 line 12",
    "How do I extract data from my W-2?",
    "What business expenses can I deduct?",
    "Explain the difference between Schedule A and standard deduction",
]

export function TaxAgentChat() {
    const { data: session, status } = useSession()
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [dragActive, setDragActive] = useState(false)
    const [requestCount, setRequestCount] = useState(0)
    const [lastRequestTime, setLastRequestTime] = useState(0)

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Initialize accessibility features
    const { announce, manageFocus } = useAccessibility({
        announceMessage: (message) => {
            // Custom announcement handling if needed
            console.log('Accessibility announcement:', message)
        }
    })

    // Scroll to bottom when new messages arrive
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [messages, scrollToBottom])

    // Rate limiting check
    const checkRateLimit = useCallback(() => {
        const now = Date.now()
        const oneMinute = 60 * 1000

        if (now - lastRequestTime > oneMinute) {
            setRequestCount(1)
            setLastRequestTime(now)
            return true
        }

        if (requestCount >= 30) {
            toast.error('Rate limit exceeded. Please wait before sending more messages.')
            return false
        }

        setRequestCount(prev => prev + 1)
        return true
    }, [requestCount, lastRequestTime])

    // Send message to agent
    const sendMessage = useCallback(async (content: string, attachments?: File[]) => {
        if (!content.trim() || isLoading) return
        if (status !== 'authenticated') {
            toast.error('Please sign in to use the tax assistant')
            return
        }
        if (!checkRateLimit()) return

        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: 'user',
            content: content.trim(),
            timestamp: new Date(),
            status: 'sent',
            attachments,
        }

        const agentMessage: Message = {
            id: crypto.randomUUID(),
            role: 'agent',
            content: '',
            timestamp: new Date(),
            status: 'sending',
        }

        setMessages(prev => [...prev, userMessage, agentMessage])
        setInputValue('')
        setIsLoading(true)

        // Announce message sent
        announce('Message sent to tax assistant')

        try {
            const request: AgentRequest = { prompt: content }
            const response = await fetch('/api/agents/invoke/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to get response from agent')
            }

            const data: AgentResponse = await response.json()

            setMessages(prev => prev.map(msg => 
                msg.id === agentMessage.id 
                    ? { ...msg, content: data.response, status: 'sent' }
                    : msg
            ))

        } catch (error) {
            console.error('Agent chat error:', error)
            setMessages(prev => prev.map(msg => 
                msg.id === agentMessage.id 
                    ? { 
                        ...msg, 
                        content: 'Sorry, I encountered an error. Please try again.', 
                        status: 'error' 
                    }
                    : msg
            ))
            toast.error(error instanceof Error ? error.message : 'Failed to send message')
        } finally {
            setIsLoading(false)
        }
    }, [isLoading, status, checkRateLimit])

    // Handle quick action
    const handleQuickAction = useCallback((action: typeof QUICK_ACTIONS[0]) => {
        if (action.id === 'upload-document') {
            fileInputRef.current?.click()
        } else {
            sendMessage(action.prompt)
        }
    }, [sendMessage])

    // Handle suggested prompt
    const handleSuggestedPrompt = useCallback((prompt: string) => {
        setInputValue(prompt)
        inputRef.current?.focus()
    }, [])

    // Handle file upload
    const handleFileUpload = useCallback((files: FileList | null) => {
        if (!files || files.length === 0) return

        const validFiles = Array.from(files).filter(file => {
            const isValidType = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'].includes(file.type)
            const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB limit
            
            if (!isValidType) {
                toast.error(`File ${file.name} is not a supported type. Please upload PDF, JPEG, or PNG files.`)
                return false
            }
            if (!isValidSize) {
                toast.error(`File ${file.name} is too large. Maximum size is 10MB.`)
                return false
            }
            return true
        })

        if (validFiles.length > 0) {
            const fileNames = validFiles.map(f => f.name).join(', ')
            sendMessage(`I've uploaded the following file(s): ${fileNames}. Please analyze and help me with these tax documents.`, validFiles)
        }
    }, [sendMessage])

    // Drag and drop handlers
    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        handleFileUpload(e.dataTransfer.files)
    }, [handleFileUpload])

    // Keyboard shortcuts
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage(inputValue)
        }
    }, [inputValue, sendMessage])

    // Clear conversation
    const clearConversation = useCallback(() => {
        setMessages([])
        setRequestCount(0)
        toast.success('Conversation cleared')
    }, [])

    // Export conversation
    const exportConversation = useCallback(() => {
        const conversationText = messages.map(msg => {
            const timestamp = msg.timestamp.toLocaleString()
            const role = msg.role === 'user' ? 'You' : 'Tax Assistant'
            return `[${timestamp}] ${role}: ${msg.content}`
        }).join('\n\n')

        const blob = new Blob([conversationText], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `tax-assistant-chat-${new Date().toISOString().split('T')[0]}.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success('Conversation exported')
    }, [messages])

    // Copy message content
    const copyMessage = useCallback((content: string) => {
        navigator.clipboard.writeText(content)
        toast.success('Message copied to clipboard')
    }, [])

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading tax assistant...</span>
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
                            Please sign in to access the Tax Assistant Chat.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="max-w-4xl mx-auto h-screen flex flex-col bg-background">
            {/* Header */}
            <Card className="rounded-none border-b">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Bot className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Tax Assistant Chat</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    AI-powered tax form assistance and guidance
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="text-xs">
                                {requestCount}/30 requests
                            </Badge>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={exportConversation}>
                                        <Download className="h-4 w-4 mr-2" />
                                        Export Chat
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={clearConversation}>
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Clear Chat
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Chat Area */}
            <div className="flex-1 flex">
                {/* Main Chat */}
                <div className="flex-1 flex flex-col">
                    {/* Messages */}
                    <ScrollArea className="flex-1 p-4">
                        <div 
                            className={`space-y-4 ${dragActive ? 'opacity-50' : ''}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            {messages.length === 0 && (
                                <div className="text-center py-12">
                                    <Bot className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                                    <h3 className="text-xl font-semibold mb-2">Welcome to Tax Assistant Chat!</h3>
                                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                        I'm here to help you with tax forms, document analysis, and filing guidance. 
                                        Ask me anything or use the quick actions below.
                                    </p>
                                    
                                    {/* Suggested Prompts */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                                        {SUGGESTED_PROMPTS.slice(0, 4).map((prompt, index) => (
                                            <Button
                                                key={index}
                                                variant="outline"
                                                className="text-left justify-start h-auto p-3"
                                                onClick={() => handleSuggestedPrompt(prompt)}
                                            >
                                                <span className="text-sm">{prompt}</span>
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex space-x-3 max-w-[80%] ${
                                        message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                                    }`}>
                                        {/* Avatar */}
                                        <div className="flex-shrink-0">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                message.role === 'user' 
                                                    ? 'bg-blue-500 text-white' 
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {message.role === 'user' ? (
                                                    <User className="h-4 w-4" />
                                                ) : (
                                                    <Bot className="h-4 w-4" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Message */}
                                        <div className={`flex flex-col space-y-1 ${
                                            message.role === 'user' ? 'items-end' : 'items-start'
                                        }`}>
                                            <div className={`relative group px-4 py-3 rounded-lg ${
                                                message.role === 'user'
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-white border border-gray-200'
                                            }`}>
                                                {message.role === 'agent' ? (
                                                    <div className="prose prose-sm max-w-none">
                                                        <ReactMarkdown 
                                                            remarkPlugins={[remarkGfm]}
                                                            className="text-gray-700"
                                                            components={{
                                                                table: ({ children }) => (
                                                                    <div className="overflow-x-auto my-4">
                                                                        <table className="min-w-full border-collapse border border-gray-300">
                                                                            {children}
                                                                        </table>
                                                                    </div>
                                                                ),
                                                                th: ({ children }) => (
                                                                    <th className="border border-gray-300 px-4 py-2 bg-gray-50 font-semibold text-left">
                                                                        {children}
                                                                    </th>
                                                                ),
                                                                td: ({ children }) => (
                                                                    <td className="border border-gray-300 px-4 py-2">
                                                                        {children}
                                                                    </td>
                                                                ),
                                                                code: ({ children, className }) => {
                                                                    const isInline = !className
                                                                    return isInline ? (
                                                                        <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">
                                                                            {children}
                                                                        </code>
                                                                    ) : (
                                                                        <div className="bg-gray-900 text-white p-4 rounded-lg overflow-x-auto my-4">
                                                                            <code>{children}</code>
                                                                        </div>
                                                                    )
                                                                },
                                                                ul: ({ children }) => (
                                                                    <ul className="list-disc pl-6 space-y-1">
                                                                        {children}
                                                                    </ul>
                                                                ),
                                                                ol: ({ children }) => (
                                                                    <ol className="list-decimal pl-6 space-y-1">
                                                                        {children}
                                                                    </ol>
                                                                ),
                                                                blockquote: ({ children }) => (
                                                                    <blockquote className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 my-4">
                                                                        {children}
                                                                    </blockquote>
                                                                ),
                                                            }}
                                                        >
                                                            {message.content || ''}
                                                        </ReactMarkdown>
                                                    </div>
                                                ) : (
                                                    <div className="whitespace-pre-wrap">{message.content}</div>
                                                )}

                                                {/* Message Actions */}
                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() => copyMessage(message.content)}
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                    </Button>
                                                </div>

                                                {/* Status Indicator */}
                                                {message.status === 'sending' && (
                                                    <div className="flex items-center justify-center mt-2">
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    </div>
                                                )}
                                                {message.status === 'error' && (
                                                    <div className="flex items-center mt-2 text-red-500">
                                                        <XCircle className="h-4 w-4 mr-1" />
                                                        <span className="text-xs">Failed to send</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Attachments */}
                                            {message.attachments && message.attachments.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {message.attachments.map((file, index) => (
                                                        <Badge key={index} variant="secondary" className="text-xs">
                                                            <Paperclip className="h-3 w-3 mr-1" />
                                                            {file.name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Timestamp */}
                                            <span className="text-xs text-muted-foreground">
                                                {message.timestamp.toLocaleTimeString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    </ScrollArea>

                    {/* Drag Overlay */}
                    {dragActive && (
                        <div className="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-500 flex items-center justify-center z-10">
                            <div className="text-center">
                                <Upload className="h-12 w-12 mx-auto text-blue-500 mb-4" />
                                <p className="text-lg font-semibold text-blue-700">Drop your tax documents here</p>
                                <p className="text-blue-600">PDF, JPEG, or PNG files (max 10MB)</p>
                            </div>
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="border-t bg-white p-4">
                        <div className="flex space-x-3">
                            <div className="flex-1">
                                <Textarea
                                    ref={inputRef}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask me about tax forms, deadlines, or upload documents for analysis..."
                                    className="min-h-[60px] resize-none"
                                    disabled={isLoading}
                                    aria-label="Chat message input"
                                />
                            </div>
                            <div className="flex flex-col space-y-2">
                                <Button
                                    onClick={() => fileInputRef.current?.click()}
                                    variant="outline"
                                    size="icon"
                                    disabled={isLoading}
                                    aria-label="Upload file"
                                >
                                    <Paperclip className="h-4 w-4" />
                                </Button>
                                <Button
                                    onClick={() => sendMessage(inputValue)}
                                    disabled={isLoading || !inputValue.trim()}
                                    aria-label="Send message"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex flex-wrap gap-2 mt-3">
                            {QUICK_ACTIONS.map((action) => {
                                const Icon = action.icon
                                return (
                                    <Button
                                        key={action.id}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleQuickAction(action)}
                                        disabled={isLoading}
                                        className="h-8 text-xs"
                                    >
                                        <Icon className="h-3 w-3 mr-1" />
                                        {action.label}
                                    </Button>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
                aria-label="File upload input"
            />
        </div>
    )
}
