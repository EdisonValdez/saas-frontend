import * as z from 'zod'

import { siteConfig } from '@/config/site'
import { getAccessToken } from '@/lib/get-access-token'
import { getApiURLWithEndpoint } from '@/lib/utils'
import { isJWTTokenValid } from '@/lib/verify-token'

const routeContextSchema = z.object({
    params: z.object({
        workspaceId: z.string(),
    }),
})

//GET the chats for the workspace

export async function GET(request: Request, context: z.infer<typeof routeContextSchema>) {
    const accessToken = await getAccessToken()

    // this is a redundant check if using middleware
    if (!accessToken || !(await isJWTTokenValid(accessToken))) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    const { params } = routeContextSchema.parse(context)
    const workspaceId = params.workspaceId
    const endpoint = getApiURLWithEndpoint(siteConfig.backend.api.workspaces.workspaces) + `${workspaceId}/chats/`

    const apiResponse = await fetch(endpoint, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `JWT ${accessToken}`,
        },
        method: 'GET',
    })

    if (!apiResponse.ok) {
        const errorDetails = await apiResponse.json()
        throw new Error(`API error with status ${apiResponse.status}: ${errorDetails}`)
    }

    const data = await apiResponse.json()
    return new Response(JSON.stringify(data), { status: apiResponse.status })
}

//POST a new chat for the workspace
export async function POST(request: Request, context: z.infer<typeof routeContextSchema>) {
    const accessToken = await getAccessToken()

    // this is a redundant check if using middleware
    if (!accessToken || !(await isJWTTokenValid(accessToken))) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    const { params } = routeContextSchema.parse(context)
    const workspaceId = params.workspaceId
    const endpoint = getApiURLWithEndpoint(siteConfig.backend.api.workspaces.workspaces) + `${workspaceId}/chats/`

    const body = await request.json()

    const apiResponse = await fetch(endpoint, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `JWT ${accessToken}`,
        },
        method: 'POST',
        body: JSON.stringify(body),
    })

    if (!apiResponse.ok) {
        const errorDetails = await apiResponse.json()
        throw new Error(`API error with status ${apiResponse.status}: ${errorDetails}`)
    }

    const data = await apiResponse.json()
    return new Response(JSON.stringify(data), { status: apiResponse.status })
}
