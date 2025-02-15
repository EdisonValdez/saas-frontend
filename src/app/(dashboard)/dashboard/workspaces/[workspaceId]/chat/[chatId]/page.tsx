import { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { signIn } from '@/lib/auth'

import { getCurrentUserServer } from '@/lib/session'
import { getChatSession } from '@/lib/chat'

import { ChatSession } from '@/types/chat'
import { ChatSessionUI } from '@/components/chat/chat-session-ui'

export const metadata: Metadata = {
    title: 'Chat Session',
    description: 'View and participate in your workspace chat session.',
}

export default async function ChatSessionPage({ params }: { params: { chatId: string; workspaceId: string } }) {
    // Step 1: Fetch the current user
    const user = await getCurrentUserServer()

    // Step 2: Redirect to sign-in if the user is not authenticated
    if (!user) {
        redirect(await signIn())
    }

    // Step 3: Fetch the chat session
    const chatSession = await getChatSession(params.chatId, params.workspaceId)

    // Step 4: Handle the case where the chat session is not found
    if (!chatSession) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-3xl font-bold">Chat Session Not Found</h1>
                    <p className="text-lg">
                        The chat session you are looking for does not exist or you do not have access to it.
                    </p>
                </div>
            </div>
        )
    }

    // Step 5: Render the chat session UI
    return <ChatSessionUI chatSession={chatSession as ChatSession} />
}
