import { auth } from '@/lib/auth'

import { UserDetails } from '@/types/auth'
import { Workspace } from '@/types/workspaces'
import { siteConfig } from '@/config/site'

import { getApiURLWithEndpoint } from './utils'

export async function getTeamInvitations(team_id: string): Promise<Workspace[] | null | undefined> {
    const session = await auth()

    if (!session) {
        const userDetails: UserDetails = {}
        return userDetails.workspaces
    }

    const UserWorkspaceListEndpoint = getApiURLWithEndpoint(siteConfig.backend.api.workspaces.teamInvitations + team_id)

    const response = await fetch(UserWorkspaceListEndpoint, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access}`,
        },
        method: 'GET',
        cache: 'no-store',
    })
    const data = await response.json()
    return data
}
