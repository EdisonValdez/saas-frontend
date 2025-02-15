import { Metadata } from 'next'

import { getSharedChatSession } from '@/lib/chat'

import { SharedChatSessionUI } from '@/components/chat/shared-chat-session-ui'

export const metadata: Metadata = {
    title: 'Workspace Home',
    description: 'Welcome to your workspace',
}

export default async function ChatSessionPage(props: {
    params: Promise<{ shareableLink: string; workspaceId: string }>
}) {
    const params = await props.params
    const chatSession = await getSharedChatSession(params.shareableLink, params.workspaceId)

    if (!chatSession) {
        return <p>Please make sure you have access to the chat and shareable link is correct.</p>
    }

    return <SharedChatSessionUI chatSession={chatSession} />
}
