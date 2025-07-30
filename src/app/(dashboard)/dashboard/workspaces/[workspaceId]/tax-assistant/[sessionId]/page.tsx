import { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { signIn } from '@/lib/auth'
import { getCurrentUserServer } from '@/lib/session'
import { TaxAssistantSessionUI } from '@/components/agents/tax-assistant-session-ui'
import { TaxAssistantSession } from '@/types/agents'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
    title: 'Tax Assistant Session',
    description: 'Interact with your tax assistant AI in this consultation session',
}

async function getTaxAssistantSession(workspaceId: string, sessionId: string): Promise<TaxAssistantSession | null> {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${siteConfig.paths.api.workspaces.workspaces}${workspaceId}/tax-assistant/${sessionId}/`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-store',
            }
        )

        if (!response.ok) {
            console.error('Failed to fetch tax assistant session:', response.statusText)
            return null
        }

        return await response.json()
    } catch (error) {
        console.error('Error fetching tax assistant session:', error)
        return null
    }
}

export default async function TaxAssistantSessionPage({ 
    params 
}: { 
    params: { workspaceId: string; sessionId: string } 
}) {
    const user = await getCurrentUserServer()

    if (!user) {
        redirect(await signIn())
    }

    const taxAssistantSession = await getTaxAssistantSession(params.workspaceId, params.sessionId)

    if (!taxAssistantSession) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-3xl font-bold">Tax Assistant Session Not Found</h1>
                    <p className="text-lg mt-2">
                        The tax assistant session you are looking for does not exist or you do not have access to it.
                    </p>
                </div>
            </div>
        )
    }

    return <TaxAssistantSessionUI taxAssistantSession={taxAssistantSession} />
}
