import { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { signIn } from '@/lib/auth'
import { getCurrentUserServer } from '@/lib/session'
import { ClientManagementEnhanced } from '@/components/clients/client-management-enhanced'

export const metadata: Metadata = {
    title: 'Client Management',
    description: 'Manage your clients, profiles, and subscription limits',
}

export default async function ClientManagementPage() {
    const user = await getCurrentUserServer()

    if (!user) {
        redirect(await signIn())
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <ClientManagementEnhanced />
        </div>
    )
}
