import { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { Workspace } from '@/types/workspaces'
import { signIn } from '@/lib/auth'

import { getCurrentUserServer } from '@/lib/session'
import { getUserWorkspaces } from '@/lib/user-workspaces'
import { getWorkspaceChatSessions } from '@/lib/chat'

import { ChatSessionsList } from '@/components/chat/chat-list'

export const metadata: Metadata = {
    title: 'Workspace Home',
    description: 'Welcome to your workspace',
}

export default async function ChatHistoryPage({ params }: { params: { workspaceId: string } }) {
    // Step 1: Fetch the current user
    const user = await getCurrentUserServer()

    // Step 2: Redirect to sign-in if the user is not authenticated
    if (!user) {
        redirect(await signIn(`/dashboard/workspaces/${params.workspaceId}/chat/history`))
    }

    // Step 3: Fetch user workspaces and find the target workspace
    const workspaces = await getUserWorkspaces()
    const workspace = workspaces?.find((w) => w.id === params.workspaceId) as Workspace

    // Step 4: Handle the case where the workspace is not found
    if (!workspace) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-3xl font-bold">Workspace Not Found</h1>
                    <p className="text-lg">
                        The workspace you are looking for does not exist or you do not have access to it.
                    </p>
                </div>
            </div>
        )
    }

    // Step 5: Fetch chat sessions for the workspace
    const chatSessions = await getWorkspaceChatSessions(params.workspaceId)

    // Step 6: Render the page content
    return (
        <main className="p-4 sm:px-6 sm:py-0 md:gap-8">
            {chatSessions ? (
                <ChatSessionsList workspaceId={workspace.id} chatSessions={chatSessions} />
            ) : (
                <div className="flex justify-center items-center min-h-screen">
                    <p>No chat sessions found for this workspace.</p>
                </div>
            )}
        </main>
    )
}
