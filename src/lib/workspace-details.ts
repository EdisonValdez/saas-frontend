import { siteConfig } from '@/config/site'

import { getAccessToken } from './get-access-token'
import { getApiURLWithEndpoint } from './utils'
import { Workspace } from '@/types/workspaces'

// export async function fetchWorkspace(workspaceId: string) {
//     try {
//         const accessToken = await getAccessToken()

//         const WorkspaceEndpoint = getApiURLWithEndpoint(
//             siteConfig.backend.api.workspaces.workspaces.concat(workspaceId) + '/'
//         )
//         const response = await fetch(WorkspaceEndpoint, {
//             headers: {
//                 'Content-Type': 'application/json',
//                 Authorization: `Bearer ${accessToken}`,
//             },
//             method: 'GET',
//         })
//         const data = await response.json()
//         return data as Workspace
//     } catch (error) {
//         throw new Error('Failed to fetch workspace')
//     }
// }

export async function fetchWorkspace(workspaceId: string) {
    try {
        const accessToken = await getAccessToken()

        const WorkspaceEndpoint = getApiURLWithEndpoint(
            siteConfig.backend.api.workspaces.workspaces.concat(workspaceId) + '/'
        )
        const response = await fetch(WorkspaceEndpoint, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${accessToken}`,
            },
            method: 'GET',
        })

        if (!response.ok) {
            // throw new Error(`Failed to fetch workspace: ${response.statusText}`)
            return null
        }

        const data = await response.json()
        return data as Workspace
    } catch (error) {
        // throw new Error('Failed to fetch workspace')
        return null
    }
}
