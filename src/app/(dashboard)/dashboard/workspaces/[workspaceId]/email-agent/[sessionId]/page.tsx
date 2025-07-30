import { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { signIn } from '@/lib/auth'
import { getCurrentUserServer } from '@/lib/session'
import { EmailAgentSessionUI } from '@/components/agents/email-agent-session-ui'
import { EmailAgentSession } from '@/types/agents'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
    title: 'Email Agent Session',
    description: 'Compose professional emails with AI assistance in this session',
}

async function getEmailAgentSession(workspaceId: string, sessionId: string): Promise<EmailAgentSession | null> {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${siteConfig.paths.api.workspaces.workspaces}${workspaceId}/email-agent/${sessionId}/`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-store',
            }
        )

        if (!response.ok) {
            console.error('Failed to fetch email agent session:', response.statusText)
            return null
        }

        return await response.json()
    } catch (error) {
        console.error('Error fetching email agent session:', error)
        return null
    }
}

export default async function EmailAgentSessionPage({ 
    params 
}: { 
    params: { workspaceId: string; sessionId: string } 
}) {
    const user = await getCurrentUserServer()

    if (!user) {
        redirect(await signIn())
    }

    const emailAgentSession = await getEmailAgentSession(params.workspaceId, params.sessionId)

    if (!emailAgentSession) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-3xl font-bold">Email Agent Session Not Found</h1>
                    <p className="text-lg mt-2">
                        The email agent session you are looking for does not exist or you do not have access to it.
                    </p>
                </div>
            </div>
        )
    }

    return <EmailAgentSessionUI emailAgentSession={emailAgentSession} />
}
