'use client'

import React, { useEffect, useRef } from 'react'

import { Badge } from '@/components/ui/badge'
import { MessageList } from '@/components/chat/chat-messages'

import { ChatSession } from '@/types/chat'

interface ChatSessionUIProps {
    chatSession: ChatSession
}

export function SharedChatSessionUI({ chatSession }: ChatSessionUIProps) {
    // const params = useParams<{ workspaceId: string; chatId: string }>()
    const messageEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [chatSession.messages])

    if (!chatSession) {
        return null
    }

    return (
        <main className="p-4 sm:px-6 sm:py-0 md:gap-8">
            <div className="flex-1 space-y-4 p-2 pt-3">
                <div className="flex flex-col">
                    <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
                        <h1 className="text-xl font-semibold">{chatSession.name}</h1>{' '}
                    </header>

                    <div className="grid flex-1 gap-4 overflow-auto p-4">
                        <div className="relative flex h-full min-h-screen flex-col rounded-xl bg-muted/50 p-2 pb-24">
                            <Badge variant="outline" className="absolute right-3 top-3">
                                Output
                            </Badge>
                            <MessageList chatSession={chatSession} />
                            <div ref={messageEndRef} />
                            <div className="flex-1" />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
