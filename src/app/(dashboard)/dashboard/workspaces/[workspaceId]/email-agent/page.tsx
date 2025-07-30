import { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { signIn } from '@/lib/auth'
import { getCurrentUserServer } from '@/lib/session'
import { EmailAgentSessionsList } from '@/components/agents/email-agent-list'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
    title: 'Email Agent',
    description: 'Manage your email composition sessions with AI assistance',
}

async function getEmailAgentSessions(workspaceId: string) {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${siteConfig.paths.api.workspaces.workspaces}${workspaceId}/email-agent/`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-store',
            }
        )

        if (!response.ok) {
            console.error('Failed to fetch email agent sessions:', response.statusText)
            return []
        }

        return await response.json()
    } catch (error) {
        console.error('Error fetching email agent sessions:', error)
        return []
    }
}

export default async function EmailAgentPage(props: { params: Promise<{ workspaceId: string }> }) {
    const params = await props.params
    const user = await getCurrentUserServer()

    if (!user) {
        redirect(await signIn())
    }

    const emailAgentSessions = await getEmailAgentSessions(params.workspaceId)

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <EmailAgentSessionsList workspaceId={params.workspaceId} emailAgentSessions={emailAgentSessions} />
        </div>
    )
}
