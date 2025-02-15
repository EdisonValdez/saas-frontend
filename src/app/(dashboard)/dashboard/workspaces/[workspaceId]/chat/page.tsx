import { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { Workspace } from '@/types/workspaces'
import { signIn } from '@/lib/auth'

import { getCurrentUserServer } from '@/lib/session'
import { getUserWorkspaces } from '@/lib/user-workspaces'
import { ChatSessionCreateForm } from '@/components/chat/chat-session-create-form'

export const metadata: Metadata = {
    title: 'Workspace Chats',
    description: 'Create or join chat sessions within your workspace.',
}

export default async function ChatsPage({ params }: { params: { workspaceId: string } }) {
    // Step 1: Fetch the current user
    const user = await getCurrentUserServer()

    // Step 2: Redirect to sign-in if the user is not authenticated
    if (!user) {
        redirect(await signIn())
    }

    // Step 3: Fetch user workspaces and find the target workspace
    const workspaces = await getUserWorkspaces()
    const workspace = workspaces?.find((w) => w.id === params.workspaceId) as Workspace

    // Step 4: Handle the case where the workspace is not found
    if (!workspace) {
        redirect('/')
    }

    // Step 5: Render the chat session creation form
    return (
        <main className="flex justify-center items-center min-h-screen">
            <ChatSessionCreateForm workspaceId={params.workspaceId} />
        </main>
    )
}
