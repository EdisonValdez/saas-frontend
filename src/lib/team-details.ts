import { siteConfig } from '@/config/site'

import { getAccessToken } from './get-access-token'
import { getApiURLWithEndpoint } from './utils'

// export async function fetchTeam(teamId: string) {
//     try {
//         const accessToken = await getAccessToken()
//         const TeamEndpoint = getApiURLWithEndpoint(siteConfig.backend.api.workspaces.teams.concat(teamId + '/'))
//         const response = await fetch(TeamEndpoint, {
//             headers: {
//                 'Content-Type': 'application/json',
//                 Authorization: `JWT ${accessToken}`,
//             },
//             method: 'GET',
//         })
//         const data = await response.json()
//         return data
//     } catch (error) {
//         console.log('error', error)
//         throw new Error('Failed to fetch team')
//     }
// }

export async function fetchTeam(teamId: string) {
    try {
        const accessToken = await getAccessToken()
        const TeamEndpoint = getApiURLWithEndpoint(siteConfig.backend.api.workspaces.teams.concat(teamId + '/'))
        const response = await fetch(TeamEndpoint, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${accessToken}`,
            },
            method: 'GET',
        })

        if (!response.ok) {
            // throw new Error(`Failed to fetch team: ${response.statusText}`)
            return null
        }

        const data = await response.json()
        return data
    } catch (error) {
        // throw new Error('Failed to fetch team')
        return null
    }
}
