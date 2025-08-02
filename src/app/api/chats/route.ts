import * as z from 'zod'

import { siteConfig } from '@/config/site'
import { getAccessToken } from '@/lib/get-access-token'
import { getApiURLWithEndpoint } from '@/lib/utils'
import { isJWTTokenValid } from '@/lib/verify-token'

const workspaceIdSchema = z.object({
    workspaceId: z.string(),
})

//GET /api/workspaces
//Get all the chats for the authenticated user and workspace

export async function GET(request: Request) {
    const accessToken = await getAccessToken()

    //this is a redundant check if using middleware
    if (!accessToken || !(await isJWTTokenValid(accessToken))) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    try {
        const body = await request.json()
        const workspaceId = workspaceIdSchema.parse(body).workspaceId
        const endpoint = getApiURLWithEndpoint(siteConfig.backend.api.workspaces.workspaces) + `${workspaceId}/chats/`

        const apiResponse = await fetch(endpoint, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            method: 'GET',
        })

        if (!apiResponse.ok) {
            const errorDetails = await apiResponse.json()
            throw new Error(`API error with status ${apiResponse.status}: ${errorDetails}`)
        }

        const data = await apiResponse.json()
        return new Response(JSON.stringify(data), { status: apiResponse.status })
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
        })
    }
}
