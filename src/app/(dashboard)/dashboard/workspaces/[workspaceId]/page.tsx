import { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { Workspace } from '@/types/workspaces'
import { signIn } from '@/lib/auth'

import { getCurrentUserServer } from '@/lib/session'
import { getUserWorkspaces } from '@/lib/user-workspaces'

export const metadata: Metadata = {
    title: 'Workspace Home',
    description: 'Welcome to your workspace',
}

export default async function WorkspaceDetailPage(props: { params: Promise<{ workspaceId: string }> }) {
    const params = await props.params
    const userData = getCurrentUserServer()
    const workspacesData = getUserWorkspaces()

    const [user, workspaces] = await Promise.all([userData, workspacesData])

    if (!user) {
        redirect(await signIn())
    }

    const workspace = workspaces?.filter((w) => w.id === params.workspaceId)[0] as Workspace

    if (!workspace) {
        redirect('/')
    }

    return <div className="flex flex-1 flex-col gap-4 p-4 pt-0"></div>
}
