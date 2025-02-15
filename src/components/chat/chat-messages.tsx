/* eslint-disable @typescript-eslint/no-unused-vars */

'use client'

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChatSession, Message } from '@/types/chat'
import { MessageMarkdown } from './message-markdown'
import { siteConfig } from '@/config/site'
import { toast } from '@/components/ui/use-toast'
import { ChatMessagePayload } from './chat-message-form'
import { Button } from '@/components/ui/button'
import { Pagination, PaginationItem, PaginationContent } from '@/components/ui/pagination'
import { ChevronLeft, ChevronRight, RefreshCw, Loader, Copy, Languages, Volume } from 'lucide-react'
import { Icons } from '@/components/icons'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface MessageListProps {
    chatSession: ChatSession
}

export function MessageList({ chatSession }: MessageListProps) {
    const router = useRouter()
    const messages = chatSession.messages

    const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
    const [updatedContent, setUpdatedContent] = useState<string>('')
    const [isSaving, setIsSaving] = useState(false)
    const [responseIndices, setResponseIndices] = useState<{ [key: string]: number }>({})
    const [isRegenerating, setIsRegenerating] = useState<string | null>(null)

    const [translateModalOpen, setTranslateModalOpen] = useState(false)
    const [selectedWord, setSelectedWord] = useState('')
    const [translatedWord, setTranslatedWord] = useState('')
    const [actionsModalOpen, setActionsModalOpen] = useState(false)
    const [selectedText, setSelectedText] = useState('')
    const [isSelecting, setIsSelecting] = useState(false)
    const selectionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const [isTranslating, setIsTranslating] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)

    const topLevelMessages = useMemo(
        () => (messages ? messages.filter((message) => !message.parent_message) : []),
        [messages]
    )

    const handleDoubleClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
        const selection = window.getSelection()
        if (selection && selection.toString().trim()) {
            const word = selection.toString().trim()
            setSelectedWord(word)
            setTranslateModalOpen(true)
            setTranslatedWord(`Translated: ${word}`)
        }
    }, [])

    const handleSelection = useCallback(() => {
        const selection = window.getSelection()
        if (selection && selection.toString().trim()) {
            setSelectedText(selection.toString().trim())
            setActionsModalOpen(true)
        }
    }, [])

    const handleMouseDown = useCallback(() => {
        setIsSelecting(false)
        if (selectionTimeoutRef.current) {
            clearTimeout(selectionTimeoutRef.current)
        }
        selectionTimeoutRef.current = setTimeout(() => {
            setIsSelecting(true)
        }, 200)
    }, [])

    const handleMouseUp = useCallback(() => {
        if (selectionTimeoutRef.current) {
            clearTimeout(selectionTimeoutRef.current)
        }

        const selection = window.getSelection()
        if (selection && selection.toString().trim()) {
            const selectedText = selection.toString().trim()
            if (isSelecting) {
                setSelectedText(selectedText)
                setActionsModalOpen(true)
            } else {
                setSelectedWord(selectedText)
                setTranslateModalOpen(true)
                setIsTranslating(true)
                setTimeout(() => {
                    setTranslatedWord(`Translated: ${selectedText}`)
                    setIsTranslating(false)
                }, 1000)
            }
        }
        setIsSelecting(false)
    }, [isSelecting])

    const handleSpeak = useCallback((text: string) => {
        setIsSpeaking(true)
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.onend = () => setIsSpeaking(false)
        window.speechSynthesis.speak(utterance)
    }, [])

    // Stop speech when modal is closed
    useEffect(() => {
        if (!translateModalOpen && !actionsModalOpen) {
            window.speechSynthesis.cancel()
            setIsSpeaking(false)
        }
    }, [translateModalOpen, actionsModalOpen])

    if (!messages) return null

    const getRoleColor = (role: 'user' | 'assistant' | 'system' | 'tool'): string => {
        switch (role) {
            case 'user':
                return 'text-blue-600 dark:text-blue-400'
            case 'assistant':
                return 'text-green-600 dark:text-green-400'
            case 'system':
                return 'text-gray-600 dark:text-gray-400'
            case 'tool':
                return 'text-yellow-600 dark:text-yellow-400'
            default:
                return 'text-black dark:text-white'
        }
    }

    const handleEditClick = (message: Message) => {
        setEditingMessageId(message.id)
        setUpdatedContent(message.content)
    }

    const handleSaveClick = async () => {
        if (!updatedContent.trim()) {
            toast({
                title: 'Message not sent',
                description: 'Message content is required',
                variant: 'destructive',
            })
            return
        }

        setIsSaving(true)

        const endpoint = `${siteConfig.paths.api.workspaces.workspaces}${chatSession.workspace.id}/chats/${chatSession.id}/messages/${editingMessageId}`
        const payload: ChatMessagePayload = {
            role: 'user',
            content: updatedContent,
        }

        try {
            const res = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })

            if (res.ok) {
                toast({
                    title: 'Message updated',
                    description: 'Your message has been updated successfully',
                    variant: 'default',
                })
                router.refresh()
            } else {
                throw new Error('Failed to update message')
            }
        } catch (error) {
            console.error('Error:', error)
            toast({
                title: 'Update failed',
                description: 'There was an error updating your message. Please try again.',
                variant: 'destructive',
            })
        } finally {
            setIsSaving(false)
            setEditingMessageId(null)
        }
    }

    const handleRegenerateClick = async (message: Message) => {
        setIsRegenerating(message.id)
        const endpoint = `${siteConfig.paths.api.workspaces.workspaces}${chatSession.workspace.id}/chats/${chatSession.id}/messages/${message.id}/`
        const payload: ChatMessagePayload = {
            role: message.role,
            content: message.content,
        }

        try {
            const res = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })

            if (res.ok) {
                toast({
                    title: 'Regenerating response',
                    description: 'A new response is being generated for this message.',
                    variant: 'default',
                })
                router.refresh()
                setResponseIndices((prev) => ({
                    ...prev,
                    [message.id]: 0,
                }))
            } else {
                throw new Error('Failed to regenerate response')
            }
        } catch (error) {
            console.error('Error:', error)
            toast({
                title: 'Regeneration failed',
                description: 'There was an error generating a new response. Please try again.',
                variant: 'destructive',
            })
        } finally {
            setIsRegenerating(null)
        }
    }

    const handleCopy = (content: string) => {
        navigator.clipboard.writeText(content)
        toast({
            title: 'Copied to clipboard',
            description: 'The message content has been copied.',
            variant: 'default',
        })
    }

    const handlePaginationChange = (messageId: string, responses: Message[], newIndex: number) => {
        if (newIndex >= 0 && newIndex < responses.length) {
            setResponseIndices((prev) => ({
                ...prev,
                [messageId]: newIndex,
            }))
        }
    }

    const renderMessages = (messages: Message[]) => {
        const sortedMessages = messages
            .filter((message) => message.role !== 'system')
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

        return sortedMessages.map((message) => {
            const currentResponseIndex = responseIndices[message.id] || 0

            return (
                <div
                    key={message.id}
                    className={`p-4 rounded-lg shadow-sm w-full mb-4 ${
                        message.role === 'user' ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-green-50 dark:bg-green-900/20'
                    }`}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                            <span className={`font-bold ${getRoleColor(message.role)}`}>
                                {message.role.toUpperCase()}
                            </span>
                            {message.role === 'user' && (
                                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                                    ({message.user.email})
                                </span>
                            )}
                        </div>
                        <div className="flex items-center space-x-2">
                            {message.role === 'user' && (
                                <>
                                    <button
                                        className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                        onClick={() => handleEditClick(message)}
                                        aria-label={`Edit message from ${message.user.email}`}
                                    >
                                        <Icons.edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                        onClick={() => handleRegenerateClick(message)}
                                        disabled={isRegenerating === message.id}
                                        aria-label={`Regenerate response for message from ${message.user.email}`}
                                    >
                                        {isRegenerating === message.id ? (
                                            <Loader className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <RefreshCw className="h-4 w-4" />
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    {editingMessageId === message.id ? (
                        <div>
                            <textarea
                                value={updatedContent}
                                onChange={(e) => setUpdatedContent(e.target.value)}
                                className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                rows={4}
                            />
                            <div className="flex justify-end space-x-2 mt-2">
                                <Button onClick={handleSaveClick} disabled={isSaving} size="sm">
                                    {isSaving ? 'Saving...' : 'Save'}
                                </Button>
                                <Button onClick={() => setEditingMessageId(null)} variant="outline" size="sm">
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="prose dark:prose-invert max-w-none">
                            <MessageMarkdown content={message.content} />
                        </div>
                    )}
                    {message.responses &&
                        message.responses.length > 0 &&
                        currentResponseIndex < message.responses.length && (
                            <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg relative">
                                    {message.responses.slice().reverse()[currentResponseIndex] && (
                                        <div className="prose dark:prose-invert max-w-none">
                                            <MessageMarkdown
                                                content={
                                                    message.responses.slice().reverse()[currentResponseIndex].content
                                                }
                                            />
                                        </div>
                                    )}
                                    <button
                                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                        onClick={() =>
                                            handleCopy(
                                                message.responses.slice().reverse()[currentResponseIndex].content
                                            )
                                        }
                                        aria-label="Copy response content"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </button>
                                </div>
                                <Pagination className="flex justify-end mt-2">
                                    <PaginationContent>
                                        <PaginationItem>
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                className="h-8 w-8 dark:border-gray-700 dark:text-gray-300"
                                                onClick={() =>
                                                    handlePaginationChange(
                                                        message.id,
                                                        message.responses.slice().reverse(),
                                                        currentResponseIndex - 1
                                                    )
                                                }
                                                disabled={currentResponseIndex === 0}
                                                aria-label="Previous Response"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                        </PaginationItem>
                                        <PaginationItem>
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                className="h-8 w-8 dark:border-gray-700 dark:text-gray-300"
                                                onClick={() =>
                                                    handlePaginationChange(
                                                        message.id,
                                                        message.responses.slice().reverse(),
                                                        currentResponseIndex + 1
                                                    )
                                                }
                                                disabled={currentResponseIndex === message.responses.length - 1}
                                                aria-label="Next Response"
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                </div>
            )
        })
    }

    return (
        <>
            <div className="flex justify-center items-start min-h-screen py-6 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                <div className="w-full max-w-4xl space-y-4">{renderMessages(topLevelMessages)}</div>
            </div>

            <Dialog open={translateModalOpen} onOpenChange={setTranslateModalOpen}>
                <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">Translation</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4 space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Original</h3>
                            <p className="mt-1 text-lg font-semibold">{selectedWord}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Translated</h3>
                            <p className="mt-1 text-lg font-semibold">{translatedWord}</p>
                        </div>
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <Button onClick={() => handleCopy(selectedWord)} variant="outline" size="sm">
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Original
                        </Button>
                        <Button onClick={() => handleCopy(translatedWord)} variant="outline" size="sm">
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Translation
                        </Button>
                        <Button
                            onClick={() => handleSpeak(selectedWord)}
                            variant="outline"
                            size="sm"
                            disabled={isSpeaking}
                        >
                            <Volume className="mr-2 h-4 w-4" />
                            {isSpeaking ? 'Speaking...' : 'Speak'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={actionsModalOpen} onOpenChange={setActionsModalOpen}>
                <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">Text Actions</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                        <h3 className="text-sm font-medium text-gray-500">Selected Text</h3>
                        <p className="mt-1 text-lg font-semibold break-words">{selectedText}</p>
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <Button onClick={() => handleCopy(selectedText)} variant="outline">
                            <Copy className="mr-2 h-4 w-4" />
                            Copy
                        </Button>
                        <Button onClick={() => handleSpeak(selectedText)} variant="outline" disabled={isSpeaking}>
                            <Volume className="mr-2 h-4 w-4" />
                            {isSpeaking ? 'Speaking...' : 'Speak'}
                        </Button>
                        <Button
                            onClick={() => {
                                /* Implement translation */
                            }}
                            variant="outline"
                            disabled={isTranslating}
                        >
                            <Languages className="mr-2 h-4 w-4" />
                            {isTranslating ? 'Translating...' : 'Translate'}
                        </Button>
                        <Button
                            onClick={() => {
                                /* Implement save-to */
                            }}
                            variant="outline"
                        >
                            Save to notes
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
