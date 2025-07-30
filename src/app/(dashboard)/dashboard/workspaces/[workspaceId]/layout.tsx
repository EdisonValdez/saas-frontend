import { redirect } from 'next/navigation'

import { Workspace } from '@/types/workspaces'

import { getUserWorkspaces } from '@/lib/user-workspaces'
import { getCurrentUserServer } from '@/lib/session'
import { signIn } from '@/lib/auth'

interface WorkspaceLayoutProps {
    children: React.ReactNode
    params: Promise<{
        workspaceId: string
    }>
}

export default async function WorkspaceLayout(props: WorkspaceLayoutProps) {
    const params = await props.params

    const { children } = props

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

    return <>{children}</>
}
