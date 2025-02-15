import * as z from 'zod'

import { siteConfig } from '@/config/site'
import { getAccessToken } from '@/lib/get-access-token'
import { getApiURLWithEndpoint } from '@/lib/utils'
import { isJWTTokenValid } from '@/lib/verify-token'

const routeContextSchema = z.object({
    params: z.object({
        workspaceId: z.string(),
        membershipId: z.string(),
    }),
})

const roleSchema = z.object({
    role: z.string().refine((role) => ['member', 'admin'].includes(role), {
        message: 'Invalid role',
    }),
})

// PUT /api/workspaces/[workspaceId]/memberships/update/[membershipId]
// Update a workspace membership
export async function PUT(req: Request, context: z.infer<typeof routeContextSchema>) {
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
        const role = roleSchema.parse(body)
        const payload = {
            role: role.role,
            workspace: params.workspaceId,
        }
        const WORKSPACE_MEMBERSHIP_ENDPOINT = getApiURLWithEndpoint(
            `${siteConfig.backend.api.workspaces.workspaceMemberships}${params.membershipId}/`
        )

        const apiResponse = await fetch(WORKSPACE_MEMBERSHIP_ENDPOINT, {
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

// DELETE /api/workspaces/[workspaceId]/memberships/remove/[membershipId]
// Remove a workspace membership
export async function DELETE(req: Request, context: z.infer<typeof routeContextSchema>) {
    const accessToken = await getAccessToken()

    // this is a redundant check if using middleware
    if (!accessToken || !(await isJWTTokenValid(accessToken))) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    const { params } = routeContextSchema.parse(context)
    const MEMBERSHIP_DELETE_ENDPOINT = getApiURLWithEndpoint(
        `${siteConfig.backend.api.workspaces.workspaceMemberships}${params.membershipId}/`
    )

    try {
        // No need to parse the body for a DELETE request
        const apiResponse = await fetch(MEMBERSHIP_DELETE_ENDPOINT, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${await getAccessToken()}`, // Simplified for example purposes
            },
        })

        if (!apiResponse.ok) {
            throw new Error('API responded with an error')
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
