import { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { signIn } from '@/lib/auth'
import { getCurrentUserServer } from '@/lib/session'
import { EmailAgentEnhanced } from '@/components/email/email-agent-enhanced'

export const metadata: Metadata = {
    title: 'Email Agent',
    description: 'Create professional emails with AI assistance and templates',
}

export default async function EmailAgentPage() {
    const user = await getCurrentUserServer()

    if (!user) {
        redirect(await signIn())
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <EmailAgentEnhanced />
        </div>
    )
}
