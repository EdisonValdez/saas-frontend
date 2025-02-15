'use client'

import React, { useEffect, useRef } from 'react'
import { Badge } from '@/components/ui/badge'
import { MessageList } from '@/components/chat/chat-messages'
import { ChatSessionHeader } from '@/components/chat/chat-session-header'
import { ChatSession } from '@/types/chat'
import { ChatMessageForm } from './chat-message-form'

interface ChatSessionUIProps {
    chatSession: ChatSession
}

export function ChatSessionUI({ chatSession }: ChatSessionUIProps) {
    const messageEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [chatSession.messages])

    if (!chatSession) {
        return <div className="flex items-center justify-center p-4 text-muted">Loading messages...</div>
    }

    return (
        <main className="p-4 sm:px-6 sm:py-0 md:gap-8 h-screen overflow-hidden flex flex-col">
            <ChatSessionHeader chatSession={chatSession} />

            <div className="flex-1 overflow-auto space-y-4 p-2 pt-3 rounded-xl shadow-inner relative">
                <Badge variant="outline" className="absolute right-3 top-3">
                    {chatSession.ai_model}
                </Badge>

                {/* Chat message list */}
                <MessageList chatSession={chatSession} />
                <div ref={messageEndRef} />

                {/* Chat input form */}
                <div className="sticky bottom-0 left-0 w-full flex justify-center p-4 ">
                    <div className="w-full max-w-3xl">
                        <ChatMessageForm chatSession={chatSession} />
                    </div>
                </div>
            </div>
        </main>
    )
}
