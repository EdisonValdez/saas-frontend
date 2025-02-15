import { auth } from '@/lib/auth'
import { ChatSession } from '@/types/chat'
import { siteConfig } from '@/config/site'
import { getApiURLWithEndpoint } from './utils'

export async function getWorkspaceChatSessions(workspaceId: string): Promise<ChatSession[] | null> {
    const session = await auth()

    if (!session) {
        return null
    }

    const endpoint = getApiURLWithEndpoint(siteConfig.backend.api.workspaces.workspaces) + `${workspaceId}/chats/`

    const response = await fetch(endpoint, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `JWT ${session.access}`,
        },
        method: 'GET', // Change method to 'GET' to fetch data
        cache: 'no-store',
    })

    if (!response.ok) {
        console.error('Failed to fetch workspace chat sessions:', response.statusText)
        return null
    }

    const data: ChatSession[] = await response.json()
    return data
}

export async function getChatSession(sessionId: string, workspaceId: string): Promise<ChatSession | null> {
    const session = await auth()

    if (!session) {
        return null
    }

    const endpoint =
        getApiURLWithEndpoint(siteConfig.backend.api.workspaces.workspaces) + `${workspaceId}/chats/${sessionId}/`

    const response = await fetch(endpoint, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `JWT ${session.access}`,
        },
        method: 'GET', // Change method to 'GET' to fetch data
        cache: 'no-store',
    })

    if (!response.ok) {
        console.error('Failed to fetch chat session:', response.statusText)
        return null
    }

    const data: ChatSession = await response.json()
    return data
}

export async function getSharedChatSession(shareableLink: string, workspaceId: string): Promise<ChatSession | null> {
    const endpoint =
        getApiURLWithEndpoint(siteConfig.backend.api.workspaces.workspaces) +
        `${workspaceId}/chats/shared/${shareableLink}/`

    const response = await fetch(endpoint, {
        headers: {
            'Content-Type': 'application/json',
        },
        method: 'GET', // Change method to 'GET' to fetch data
        cache: 'no-store',
    })

    if (!response.ok) {
        console.error('Failed to fetch shared chat session:', response.statusText)
        return null
    }

    const data: ChatSession = await response.json()
    return data
}

export async function updateChatSession(
    sessionId: string,
    workspaceId: string,
    updates: Partial<ChatSession>
): Promise<ChatSession | null> {
    const session = await auth()

    if (!session) {
        return null
    }

    const endpoint =
        getApiURLWithEndpoint(siteConfig.backend.api.workspaces.workspaces) + `${workspaceId}/chats/${sessionId}/`

    const response = await fetch(endpoint, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `JWT ${session.access}`,
        },
        method: 'PATCH', // Change method to 'PATCH' to update data
        body: JSON.stringify(updates),
    })

    if (!response.ok) {
        console.error('Failed to update chat session:', response.statusText)
        return null
    }

    const data: ChatSession = await response.json()
    return data
}

export async function createChatSession(
    workspaceId: string,
    sessionData: Partial<ChatSession>
): Promise<ChatSession | null> {
    const session = await auth()

    if (!session) {
        return null
    }

    const endpoint = getApiURLWithEndpoint(siteConfig.backend.api.workspaces.workspaces) + `${workspaceId}/chats/`

    const response = await fetch(endpoint, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `JWT ${session.access}`,
        },
        method: 'POST', // Change method to 'POST' to create data
        body: JSON.stringify(sessionData),
    })

    if (!response.ok) {
        console.error('Failed to create chat session:', response.statusText)
        return null
    }

    const data: ChatSession = await response.json()
    return data
}

export async function deleteChatSession(sessionId: string, workspaceId: string): Promise<boolean> {
    const session = await auth()

    if (!session) {
        return false
    }

    const endpoint =
        getApiURLWithEndpoint(siteConfig.backend.api.workspaces.workspaces) + `${workspaceId}/chats/${sessionId}/`

    const response = await fetch(endpoint, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `JWT ${session.access}`,
        },
        method: 'DELETE', // Change method to 'DELETE' to delete data
    })

    if (!response.ok) {
        console.error('Failed to delete chat session:', response.statusText)
        return false
    }

    return true
}
