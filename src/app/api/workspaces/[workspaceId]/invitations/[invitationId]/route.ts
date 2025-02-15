import * as z from 'zod'

import { siteConfig } from '@/config/site'
import { getAccessToken } from '@/lib/get-access-token'
import { getApiURLWithEndpoint } from '@/lib/utils'
import { isJWTTokenValid } from '@/lib/verify-token'

const routeContextSchema = z.object({
    params: z.object({
        workspaceId: z.string(),
        invitationId: z.string(),
    }),
})

const roleSchema = z.object({
    role: z.string(),
})

// DELETE /api/workspaces/[workspaceId]/invitations/[invitationId]
// Delete a workspace invitation
export async function DELETE(req: Request, context: z.infer<typeof routeContextSchema>) {
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
        const INVITATION_ENDPOINT = getApiURLWithEndpoint(
            `${siteConfig.backend.api.workspaces.invitations}${params.invitationId}`
        )

        const apiResponse = await fetch(INVITATION_ENDPOINT, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${accessToken}`,
            },
        })

        if (!apiResponse.ok) {
            const errorDetails = await apiResponse.json()
            throw new Error(`API error with status ${apiResponse.status}: ${errorDetails}`)
        }

        return new Response(null, { status: apiResponse.status })
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

// PUT /api/workspaces/[workspaceId]/invitations/[invitationId]
// Update a workspace invitation
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

        const INVITATION_ENDPOINT = getApiURLWithEndpoint(
            `${siteConfig.backend.api.workspaces.invitations}${params.invitationId}/`
        )

        const apiResponse = await fetch(INVITATION_ENDPOINT, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${accessToken}`,
            },
            body: JSON.stringify(role),
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
