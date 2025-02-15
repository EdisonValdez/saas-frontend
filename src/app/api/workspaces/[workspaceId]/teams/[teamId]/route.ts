import * as z from 'zod'

import { siteConfig } from '@/config/site'
import { getAccessToken } from '@/lib/get-access-token'
import { getApiURLWithEndpoint } from '@/lib/utils'
import { teamSchema } from '@/lib/validations/workspace'
import { isJWTTokenValid } from '@/lib/verify-token'

const routeContextSchema = z.object({
    params: z.object({
        workspaceId: z.string(),
        teamId: z.string(),
    }),
})

export async function PUT(req: Request, context: z.infer<typeof routeContextSchema>) {
    const accessToken = await getAccessToken()

    // this is a redundant check if using middleware
    if (!accessToken || !(await isJWTTokenValid(accessToken))) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    const { params } = routeContextSchema.parse(context)

    try {
        const body = await req.json()
        const team = teamSchema.parse(body)

        const payload = {
            name: team.name,
            ...(team.workspace && { workspace: team.workspace }),
            ...(team.slug && { slug: team.slug }),
        }

        const TEAM_UPDATE_ENDPOINT = getApiURLWithEndpoint(
            siteConfig.backend.api.workspaces.teams + params.teamId + '/'
        )
        const apiResponse = await fetch(TEAM_UPDATE_ENDPOINT, {
            method: 'PUT',
            headers: new Headers({
                'Content-Type': 'application/json',
                Authorization: `JWT ${accessToken}`,
            }),
            body: JSON.stringify(payload),
        })

        if (!apiResponse.ok) {
            const errorDetails = await apiResponse.json()
            throw new Error(`API error with status ${apiResponse.status}: ${errorDetails}`)
        }

        const data = await apiResponse.json()

        return new Response(JSON.stringify(data), { status: apiResponse.status })
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

export async function DELETE(req: Request, context: z.infer<typeof routeContextSchema>) {
    const accessToken = await getAccessToken()

    if (!accessToken || !(await isJWTTokenValid(accessToken))) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    // Assuming your routeContextSchema correctly defines 'teamId' for team routes
    const { params } = routeContextSchema.parse(context)
    const TEAM_ENDPOINT = getApiURLWithEndpoint(
        `${siteConfig.backend.api.workspaces.teams}${params.teamId}/` // Adjusted to point to the teams endpoint
    )

    try {
        const apiResponse = await fetch(TEAM_ENDPOINT, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${accessToken}`, // Token is already awaited above, no need to await again
            },
        })

        if (!apiResponse.ok) {
            const errorDetails = await apiResponse.json() // Assuming the error response is in JSON format
            throw new Error(`API error with status ${apiResponse.status}: ${JSON.stringify(errorDetails)}`)
        }

        return new Response(null, {
            status: 204, // No Content response for successful deletion
            headers: { 'Content-Type': 'application/json' },
        })
    } catch (error) {
        console.error('Error in DELETE /teams:', error) // Log the error for debugging purposes

        // Handling ZodError seems unnecessary here unless you're validating something in the request
        // If this catch primarily handles fetch errors, the ZodError check could be removed
        if (error instanceof z.ZodError) {
            return new Response(JSON.stringify({ error: 'Validation failed', details: error.issues }), {
                status: 422,
                headers: { 'Content-Type': 'application/json' },
            })
        }

        // Return a more generic error message to the client
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }
}
