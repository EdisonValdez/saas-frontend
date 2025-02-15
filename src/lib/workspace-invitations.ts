import { auth } from '@/lib/auth'

import { Invitation } from '@/types/workspaces'
import { siteConfig } from '@/config/site'

import { getApiURLWithEndpoint } from './utils'

export async function getWorkspaceInvitations(workspace_id: string): Promise<Invitation[] | null | undefined> {
    const session = await auth()

    if (!session) {
        return null
    }

    const UserWorkspaceListEndpoint = getApiURLWithEndpoint(
        siteConfig.backend.api.workspaces.workspaceInvitations + workspace_id
    )

    const response = await fetch(UserWorkspaceListEndpoint, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `JWT ${session?.access}`,
        },
        method: 'GET',
        cache: 'no-store',
    })
    const data = await response.json()
    return data
}
