import { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { signIn } from '@/lib/auth'
import { getCurrentUserServer } from '@/lib/session'
import { DocumentManagementSystem } from '@/components/documents/document-management-system'

export const metadata: Metadata = {
    title: 'Document Management',
    description: 'Upload, process, and manage client documents with AI-powered OCR',
}

export default async function DocumentsPage() {
    const user = await getCurrentUserServer()

    if (!user) {
        redirect(await signIn())
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <DocumentManagementSystem showClientSelector={true} />
        </div>
    )
}
