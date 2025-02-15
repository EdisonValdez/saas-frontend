import * as z from 'zod'

import { siteConfig } from '@/config/site'
import { getAccessToken } from '@/lib/get-access-token'
import { getApiURLWithEndpoint } from '@/lib/utils'
import { isJWTTokenValid } from '@/lib/verify-token'

const routeContextSchema = z.object({
    params: z.object({
        workspaceId: z.string(),
        teamId: z.string(), // Include teamId for leaving a specific team
    }),
})

// POST /api/workspaces/[workspaceId]/teams/[teamId]/leave
// Leave a team
export async function POST(req: Request, context: z.infer<typeof routeContextSchema>) {
    // Step 1: Get the access token and validate it
    const accessToken = await getAccessToken()

    if (!accessToken || !(await isJWTTokenValid(accessToken))) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    // Step 2: Validate route parameters
    const { params } = routeContextSchema.parse(context)
    const LEAVE_TEAM_ENDPOINT = getApiURLWithEndpoint(
        siteConfig.backend.api.workspaces.teams + params.teamId + '/leave/'
    )

    try {
        // Step 3: Send the request to leave the team
        const apiResponse = await fetch(LEAVE_TEAM_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${accessToken}`,
            },
        })
        // Step 4: Check the response from the API
        if (!apiResponse.ok) {
            const errorDetails = await apiResponse.json()
            throw new Error(`API error with status ${apiResponse.status}: ${errorDetails.message || errorDetails}`)
        }

        // Step 5: Return a successful response
        return new Response(null, {
            status: 204,
            headers: { 'Content-Type': 'application/json' },
        })
    } catch (error) {
        // Step 6: Handle potential errors
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
