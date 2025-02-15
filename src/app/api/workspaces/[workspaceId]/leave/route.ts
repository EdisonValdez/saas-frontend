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

// POST /api/workspaces/[workspaceId]/leave
// Leave a workspace
export async function POST(req: Request, context: z.infer<typeof routeContextSchema>) {
    const accessToken = await getAccessToken()

    if (!accessToken || !(await isJWTTokenValid(accessToken))) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    const { params } = routeContextSchema.parse(context)
    const LEAVE_WORKSPACE_ENDPOINT = getApiURLWithEndpoint(
        `${siteConfig.backend.api.workspaces.workspaces}${params.workspaceId}/leave/`
    )

    try {
        const apiResponse = await fetch(LEAVE_WORKSPACE_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${await getAccessToken()}`,
            },
        })

        if (!apiResponse.ok) {
            const errorDetails = await apiResponse.json()
            throw new Error(`API error with status ${apiResponse.status}: ${errorDetails}`)
        }

        return new Response(null, {
            status: 204,
            headers: { 'Content-Type': 'application/json' },
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response(JSON.stringify({ error: 'Validation failed', details: error.issues }), {
                status: 422,
                headers: { 'Content-Type': 'application/json' },
            })
        }

        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }
}
