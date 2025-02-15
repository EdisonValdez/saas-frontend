import * as z from 'zod'

import { siteConfig } from '@/config/site'
import { getAccessToken } from '@/lib/get-access-token'
import { getApiURLWithEndpoint } from '@/lib/utils'
import { isJWTTokenValid } from '@/lib/verify-token'

const routeContextSchema = z.object({
    params: z.object({
        teamId: z.string(),
        membershipId: z.string(),
        workspaceId: z.string(),
    }),
})

const roleSchema = z.object({
    role: z.string().refine((role) => ['member', 'admin'].includes(role), {
        message: 'Invalid role',
    }),
})

// PUT /api/workspaces/[workspaceId]/teams/[teamId]/memberships/update/[membershipId]
// Update a team membership
export async function PUT(req: Request, context: z.infer<typeof routeContextSchema>) {
    const { params } = routeContextSchema.parse(context)
    const accessToken = await getAccessToken()

    if (!accessToken || !(await isJWTTokenValid(accessToken))) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    try {
        const body = await req.json()
        const role = roleSchema.parse(body)
        const payload = {
            role: role.role,
            team: params.teamId,
        }
        const TEAM_MEMBERSHIP_ENDPOINT = getApiURLWithEndpoint(
            `${siteConfig.backend.api.workspaces.teamMemberships}${params.membershipId}/`
        )

        const apiResponse = await fetch(TEAM_MEMBERSHIP_ENDPOINT, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${accessToken}`,
            },
            body: JSON.stringify(payload),
        })

        if (!apiResponse.ok) {
            const errorDetails = await apiResponse.json()
            throw new Error(`API error with status ${apiResponse.status}: ${errorDetails}`)
        }

        return new Response(null, { status: apiResponse.status })
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }
}

// DELETE /api/workspaces/[workspaceId]/teams/[teamId]/memberships/[membershipId]
// Delete a team membership
export async function DELETE(req: Request, context: z.infer<typeof routeContextSchema>) {
    const { params } = routeContextSchema.parse(context)
    const accessToken = await getAccessToken()

    if (!accessToken || !(await isJWTTokenValid(accessToken))) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    const TEAM_MEMBERSHIP_ENDPOINT = getApiURLWithEndpoint(
        `${siteConfig.backend.api.workspaces.teamMemberships}${params.membershipId}/`
    )

    try {
        const apiResponse = await fetch(TEAM_MEMBERSHIP_ENDPOINT, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${accessToken}`,
            },
        })

        if (!apiResponse.ok) {
            const errorDetails = await apiResponse.json() // Assuming the API provides JSON response for errors
            throw new Error(`API error with status ${apiResponse.status}: ${JSON.stringify(errorDetails)}`)
        }

        return new Response(null, { status: 204, headers: { 'Content-Type': 'application/json' } })
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }
}
