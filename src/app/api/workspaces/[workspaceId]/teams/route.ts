import * as z from 'zod'

import { siteConfig } from '@/config/site'
import { getAccessToken } from '@/lib/get-access-token'
import { getApiURLWithEndpoint } from '@/lib/utils'
import { teamSchema } from '@/lib/validations/workspace'
import { isJWTTokenValid } from '@/lib/verify-token'

const routeContextSchema = z.object({
    params: z.object({
        workspaceId: z.string(),
    }),
})

export async function POST(req: Request, context: z.infer<typeof routeContextSchema>) {
    const { params } = routeContextSchema.parse(context)

    const accessToken = await getAccessToken()

    // this is a redundant check if using middleware
    if (!accessToken || !(await isJWTTokenValid(accessToken))) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    try {
        const body = await req.json()
        const team = teamSchema.parse(body)

        const payload = {
            name: team.name,
            workspace: params.workspaceId,
            ...(team.slug && { slug: team.slug }),
        }

        const TEAM_CREATE_ENDPOINT = getApiURLWithEndpoint(siteConfig.backend.api.workspaces.teams)

        const apiResponse = await fetch(TEAM_CREATE_ENDPOINT, {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json',
                Authorization: `JWT ${accessToken}`,
            }),
            body: JSON.stringify(payload),
        })

        const data = await apiResponse.json()

        return new Response(JSON.stringify(data), {
            status: apiResponse.status,
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
