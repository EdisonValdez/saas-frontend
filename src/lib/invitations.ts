import { siteConfig } from '@/config/site'

import { getAccessToken } from './get-access-token'
import { getApiURLWithEndpoint } from './utils'

export async function fetchInvitation(invitationId: string) {
    const accessToken = await getAccessToken()
    const TeamEndpoint = getApiURLWithEndpoint(siteConfig.backend.api.workspaces.invitations.concat(invitationId))
    const response = await fetch(TeamEndpoint, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        method: 'GET',
    })
    const data = await response.json()
    return data
}

export async function userInvitations() {
    const accessToken = await getAccessToken()
    const invitationListEndpoint = getApiURLWithEndpoint(siteConfig.backend.api.workspaces.invitations)

    const response = await fetch(invitationListEndpoint, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        method: 'GET',
    })

    if (!response.ok) {
        throw new Error('Failed to fetch invitations')
    }

    const data = await response.json()
    return data
}
