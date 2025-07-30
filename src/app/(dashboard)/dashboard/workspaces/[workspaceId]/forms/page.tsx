import { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { signIn } from '@/lib/auth'
import { getCurrentUserServer } from '@/lib/session'
import { TaxFormManagement } from '@/components/forms/tax-form-management'

export const metadata: Metadata = {
    title: 'Tax Forms',
    description: 'Create, manage, and file tax forms with intelligent automation',
}

export default async function TaxFormsPage() {
    const user = await getCurrentUserServer()

    if (!user) {
        redirect(await signIn())
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <TaxFormManagement />
        </div>
    )
}
