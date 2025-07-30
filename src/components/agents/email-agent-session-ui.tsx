'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Send, Loader2, User, Bot, FileText, AtSign } from 'lucide-react'

import { EmailAgentSession, EmailAgentMessage } from '@/types/agents'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from '@/components/ui/use-toast'
import { siteConfig } from '@/config/site'

interface EmailAgentSessionUIProps {
    emailAgentSession: EmailAgentSession
}

export function EmailAgentSessionUI({ emailAgentSession }: EmailAgentSessionUIProps) {
    const router = useRouter()
    const [messages, setMessages] = useState<EmailAgentMessage[]>(emailAgentSession.messages || [])
    const [inputValue, setInputValue] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!inputValue.trim() || isLoading) return

        const userMessage = inputValue.trim()
        setInputValue('')
        setIsLoading(true)

        try {
            const response = await fetch(
                `${siteConfig.paths.api.workspaces.workspaces}${emailAgentSession.workspace.id}/email-agent/${emailAgentSession.id}/messages/`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        prompt: userMessage,
                        workspaceId: emailAgentSession.workspace.id,
                        clientId: emailAgentSession.client_id,
                        sessionId: emailAgentSession.id,
                        agentType: 'email_agent',
                    }),
                }
            )

            if (response.ok) {
                const messageResponse = await response.json()
                setMessages((prev) => [...prev, messageResponse.user_message, messageResponse.ai_message])
                router.refresh()
            } else {
                throw new Error('Failed to send message')
            }
        } catch (error) {
            console.error('Error sending message:', error)
            toast({
                title: 'Error',
                description: 'Failed to send message. Please try again.',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'user':
                return <User className="h-4 w-4" />
            case 'assistant':
                return <Mail className="h-4 w-4" />
            default:
                return <Bot className="h-4 w-4" />
        }
    }

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'user':
                return 'bg-purple-50 text-purple-700 border-purple-200'
            case 'assistant':
                return 'bg-green-50 text-green-700 border-green-200'
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200'
        }
    }

    const getEmailTypeColor = (type: string) => {
        switch (type) {
            case 'draft':
                return 'bg-blue-100 text-blue-800'
            case 'response':
                return 'bg-green-100 text-green-800'
            case 'follow_up':
                return 'bg-orange-100 text-orange-800'
            case 'notification':
                return 'bg-purple-100 text-purple-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            {/* Header */}
            <Card className="border-b rounded-none">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Mail className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    {emailAgentSession.name}
                                    <Badge variant={emailAgentSession.status === 'active' ? 'default' : 'secondary'}>
                                        {emailAgentSession.status}
                                    </Badge>
                                </CardTitle>
                                <CardDescription className="flex items-center gap-4 mt-1">
                                    <span>Session ID: {emailAgentSession.id}</span>
                                    {emailAgentSession.client_name && (
                                        <>
                                            <Separator orientation="vertical" className="h-4" />
                                            <span className="flex items-center gap-1">
                                                <FileText className="h-3 w-3" />
                                                Client: {emailAgentSession.client_name}
                                            </span>
                                        </>
                                    )}
                                    {emailAgentSession.email_subject && (
                                        <>
                                            <Separator orientation="vertical" className="h-4" />
                                            <span className="flex items-center gap-1">
                                                <AtSign className="h-3 w-3" />
                                                Subject: {emailAgentSession.email_subject}
                                            </span>
                                        </>
                                    )}
                                </CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge className={getEmailTypeColor(emailAgentSession.email_type)}>
                                {emailAgentSession.email_type}
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                Email Agent
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Messages */}
            <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full p-6">
                    <div className="space-y-4 max-w-4xl mx-auto">
                        {messages.length === 0 ? (
                            <div className="text-center py-12">
                                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                                    Start Your Email Composition
                                </h3>
                                <p className="text-muted-foreground max-w-md mx-auto">
                                    Get help composing professional emails, responses, follow-ups, or notifications.
                                    The AI will help you with tone, structure, and content.
                                    {emailAgentSession.client_name && (
                                        <span className="block mt-2 font-medium">
                                            This session is linked to client: {emailAgentSession.client_name}
                                        </span>
                                    )}
                                    {emailAgentSession.email_subject && (
                                        <span className="block mt-2 font-medium">
                                            Subject: {emailAgentSession.email_subject}
                                        </span>
                                    )}
                                </p>
                            </div>
                        ) : (
                            messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex items-start space-x-3 p-4 rounded-lg border ${getRoleColor(message.role)}`}
                                >
                                    <div className="flex-shrink-0 mt-1">
                                        {getRoleIcon(message.role)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <span className="font-semibold text-sm uppercase tracking-wide">
                                                {message.role}
                                            </span>
                                            {message.role === 'user' && (
                                                <span className="text-xs text-muted-foreground">
                                                    ({message.user.email})
                                                </span>
                                            )}
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(message.created_at).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <div className="prose prose-sm max-w-none">
                                            <p className="whitespace-pre-wrap">{message.content}</p>
                                        </div>
                                        {message.email_metadata && (
                                            <div className="mt-3 p-3 bg-white/50 rounded border border-dashed">
                                                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                                                    Email Metadata
                                                </div>
                                                {message.email_metadata.subject && (
                                                    <div className="text-sm">
                                                        <strong>Subject:</strong> {message.email_metadata.subject}
                                                    </div>
                                                )}
                                                {message.email_metadata.recipients && (
                                                    <div className="text-sm">
                                                        <strong>To:</strong> {message.email_metadata.recipients.join(', ')}
                                                    </div>
                                                )}
                                                {message.email_metadata.cc && message.email_metadata.cc.length > 0 && (
                                                    <div className="text-sm">
                                                        <strong>CC:</strong> {message.email_metadata.cc.join(', ')}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                        {isLoading && (
                            <div className="flex items-center justify-center p-4">
                                <div className="flex items-center space-x-2 text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Email Agent is composing your message...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </ScrollArea>
            </div>

            {/* Input */}
            <Card className="border-t rounded-none">
                <CardContent className="p-4">
                    <form onSubmit={handleSendMessage} className="flex space-x-4">
                        <div className="flex-1">
                            <Input
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Describe the email you want to compose or ask for help with email writing..."
                                disabled={isLoading}
                                className="border-2 focus:border-purple-500"
                            />
                        </div>
                        <Button type="submit" disabled={isLoading || !inputValue.trim()}>
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </Button>
                    </form>
                    <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                        <span>
                            Type: {emailAgentSession.email_type} | 
                            {emailAgentSession.client_name ? ` Client: ${emailAgentSession.client_name}` : ' General email composition'}
                        </span>
                        <span>{messages.length} messages</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
