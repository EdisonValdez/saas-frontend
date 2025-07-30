import { Metadata } from 'next'
import { TaxAgentChat } from '@/components/chat/tax-agent-chat'

export const metadata: Metadata = {
    title: 'Tax Assistant Chat - AI-Powered Tax Guidance',
    description: 'Get instant help with tax forms, document analysis, and filing guidance from our AI tax assistant.',
}

export default function TaxAgentChatPage() {
    return (
        <div className="h-screen">
            <TaxAgentChat />
        </div>
    )
}
