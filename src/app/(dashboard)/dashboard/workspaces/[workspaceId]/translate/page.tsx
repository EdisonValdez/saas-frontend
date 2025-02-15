import { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { signIn } from '@/lib/auth'

import { getCurrentUserServer } from '@/lib/session'
import { fetchWorkspace } from '@/lib/workspace-details'

import TranslateForm from '@/components/translate/translate-ui'

export const metadata: Metadata = {
    title: 'Translate',
    description: 'Translate',
}

export default async function TranslatePage(props: { params: Promise<{ workspaceId: string }> }) {
    const params = await props.params
    const user = await getCurrentUserServer()
    const workspace = await fetchWorkspace(params.workspaceId)

    if (!user) {
        redirect(await signIn())
    }

    if (!workspace) {
        redirect('/dashboard')
    }

    return (
        <main className="p-4 sm:px-6 sm:py-0 md:gap-8">
            {/* <TranslateForm /> */}
            <TranslateForm />
        </main>
    )
}
