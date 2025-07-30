'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calculator, Send, Loader2, User, Bot, FileText, DollarSign } from 'lucide-react'

import { TaxAssistantSession, TaxAssistantMessage } from '@/types/agents'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from '@/components/ui/use-toast'
import { siteConfig } from '@/config/site'

interface TaxAssistantSessionUIProps {
    taxAssistantSession: TaxAssistantSession
}

export function TaxAssistantSessionUI({ taxAssistantSession }: TaxAssistantSessionUIProps) {
    const router = useRouter()
    const [messages, setMessages] = useState<TaxAssistantMessage[]>(taxAssistantSession.messages || [])
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
                `${siteConfig.paths.api.workspaces.workspaces}${taxAssistantSession.workspace.id}/tax-assistant/${taxAssistantSession.id}/messages/`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        prompt: userMessage,
                        workspaceId: taxAssistantSession.workspace.id,
                        clientId: taxAssistantSession.client_id,
                        sessionId: taxAssistantSession.id,
                        agentType: 'tax_assistant',
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
                return <Calculator className="h-4 w-4" />
            default:
                return <Bot className="h-4 w-4" />
        }
    }

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'user':
                return 'bg-blue-50 text-blue-700 border-blue-200'
            case 'assistant':
                return 'bg-green-50 text-green-700 border-green-200'
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200'
        }
    }

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            {/* Header */}
            <Card className="border-b rounded-none">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Calculator className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    {taxAssistantSession.name}
                                    <Badge variant={taxAssistantSession.status === 'active' ? 'default' : 'secondary'}>
                                        {taxAssistantSession.status}
                                    </Badge>
                                </CardTitle>
                                <CardDescription className="flex items-center gap-4 mt-1">
                                    <span>Session ID: {taxAssistantSession.id}</span>
                                    {taxAssistantSession.client_name && (
                                        <>
                                            <Separator orientation="vertical" className="h-4" />
                                            <span className="flex items-center gap-1">
                                                <FileText className="h-3 w-3" />
                                                Client: {taxAssistantSession.client_name}
                                            </span>
                                        </>
                                    )}
                                </CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                Tax Assistant
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
                                <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                                    Start Your Tax Consultation
                                </h3>
                                <p className="text-muted-foreground max-w-md mx-auto">
                                    Ask questions about tax regulations, deductions, filing requirements, or get help
                                    with specific tax scenarios.
                                    {taxAssistantSession.client_name && (
                                        <span className="block mt-2 font-medium">
                                            This session is linked to client: {taxAssistantSession.client_name}
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
                                    <div className="flex-shrink-0 mt-1">{getRoleIcon(message.role)}</div>
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
                                    </div>
                                </div>
                            ))
                        )}
                        {isLoading && (
                            <div className="flex items-center justify-center p-4">
                                <div className="flex items-center space-x-2 text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Tax Assistant is analyzing your question...</span>
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
                                placeholder="Ask about tax deductions, filing requirements, regulations..."
                                disabled={isLoading}
                                className="border-2 focus:border-blue-500"
                            />
                        </div>
                        <Button type="submit" disabled={isLoading || !inputValue.trim()}>
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </form>
                    <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                        <span>
                            {taxAssistantSession.client_name
                                ? `Context: ${taxAssistantSession.client_name}`
                                : 'General tax consultation'}
                        </span>
                        <span>{messages.length} messages</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
