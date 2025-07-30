import { Metadata } from 'next'
import { EmailAgentInterface } from '@/components/email/email-agent-interface'

export const metadata: Metadata = {
    title: 'Email Agent - AI-Powered Email Management',
    description: 'Manage tax-related emails with AI assistance, automated triage, and intelligent response generation.',
}

export default function EmailAgentPage() {
    return (
        <div className="h-screen">
            <EmailAgentInterface />
        </div>
    )
}
