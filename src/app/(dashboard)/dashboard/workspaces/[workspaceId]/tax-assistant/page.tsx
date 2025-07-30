import { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { signIn } from '@/lib/auth'
import { getCurrentUserServer } from '@/lib/session'
import { TaxAssistantSessionsList } from '@/components/agents/tax-assistant-list'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
    title: 'Tax Assistant',
    description: 'Manage your tax consultation sessions with AI assistance',
}

async function getTaxAssistantSessions(workspaceId: string) {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${siteConfig.paths.api.workspaces.workspaces}${workspaceId}/tax-assistant/`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-store', // Always fetch fresh data
            }
        )

        if (!response.ok) {
            console.error('Failed to fetch tax assistant sessions:', response.statusText)
            return []
        }

        return await response.json()
    } catch (error) {
        console.error('Error fetching tax assistant sessions:', error)
        return []
    }
}

export default async function TaxAssistantPage(props: { params: Promise<{ workspaceId: string }> }) {
    const params = await props.params
    const user = await getCurrentUserServer()

    if (!user) {
        redirect(await signIn())
    }

    const taxAssistantSessions = await getTaxAssistantSessions(params.workspaceId)

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <TaxAssistantSessionsList workspaceId={params.workspaceId} taxAssistantSessions={taxAssistantSessions} />
        </div>
    )
}
