import { auth } from '@/lib/auth'

import { Workspace } from '@/types/workspaces'
import { siteConfig } from '@/config/site'

import { getApiURLWithEndpoint } from './utils'

// export async function getUserWorkspaces(): Promise<Workspace[] | null | undefined> {
//     try {
//         const session = await auth()

//         if (!session) {
//             const userDetails: UserDetails = {}
//             return userDetails.workspaces
//         }

//         const UserWorkspaceListEndpoint = getApiURLWithEndpoint(siteConfig.backend.api.workspaces.workspaces)

//         const response = await fetch(UserWorkspaceListEndpoint, {
//             headers: {
//                 'Content-Type': 'application/json',
//                 Authorization: `JWT ${session?.access}`,
//             },
//             method: 'GET',
//             cache: 'no-store',
//         })
//         const data = await response.json()
//         return data
//     } catch (error) {
//         throw new Error('Failed to fetch user workspaces')
//     }
// }

export async function getUserWorkspaces(): Promise<Workspace[] | null> {
    try {
        const session = await auth()

        if (!session) {
            return null
        }

        const UserWorkspaceListEndpoint = getApiURLWithEndpoint(siteConfig.backend.api.workspaces.workspaces)

        const response = await fetch(UserWorkspaceListEndpoint, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.access}`,
            },
            method: 'GET',
            cache: 'no-store',
        })

        if (!response.ok) {
            // throw new Error(`Failed to fetch user workspaces: ${response.statusText}`)
            return null
        }

        const data = await response.json()
        return data as Workspace[]
    } catch (error) {
        // throw new Error('Failed to fetch user workspaces')
        return null
    }
}
