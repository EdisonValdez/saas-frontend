import { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { signIn } from '@/lib/auth'
import { getCurrentUserServer } from '@/lib/session'
import { TaxAssistantEnhanced } from '@/components/chat/tax-assistant-enhanced'

export const metadata: Metadata = {
    title: 'Tax Assistant Chat',
    description: 'AI-powered tax consultation with workspace context and document integration',
}

export default async function ChatAgentPage() {
    const user = await getCurrentUserServer()

    if (!user) {
        redirect(await signIn())
    }

    return (
        <div className="h-[calc(100vh-4rem)]">
            <TaxAssistantEnhanced />
        </div>
    )
}
