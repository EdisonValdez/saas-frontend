import * as z from 'zod'

import { siteConfig } from '@/config/site'
import { getAccessToken } from '@/lib/get-access-token'
import { getApiURLWithEndpoint } from '@/lib/utils'
import { invitationSchema } from '@/lib/validations/workspace'
import { isJWTTokenValid } from '@/lib/verify-token'

const routeContextSchema = z.object({
    params: z.object({
        workspaceId: z.string(),
    }),
})

//GET /api/workspaces/[workspaceId]/invitations
// Get all invitations for a workspace
export async function GET(req: Request, context: z.infer<typeof routeContextSchema>) {
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
        const INVITATION_LIST_ENDPOINT = getApiURLWithEndpoint(
            siteConfig.backend.api.workspaces.workspaceInvitations + params.workspaceId + '/'
        )

        const apiResponse = await fetch(INVITATION_LIST_ENDPOINT, {
            method: 'GET',
            headers: new Headers({
                'Content-Type': 'application/json',
                Authorization: `JWT ${accessToken}`,
            }),
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

// POST /api/workspaces/[workspaceId]/invitations
//Invite a user to a workspace
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
        const invitation = invitationSchema.parse(body)

        const WORKSPACE_INVITATION_CREATE_ENDPOINT = getApiURLWithEndpoint(
            siteConfig.backend.api.workspaces.invitations
        )

        const responseBody = invitationSchema.parse({
            email: invitation.email,
            role: invitation.role,
            workspace: params.workspaceId,
        })

        const apiResponse = await fetch(WORKSPACE_INVITATION_CREATE_ENDPOINT, {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json',
                Authorization: `JWT ${accessToken}`,
            }),
            body: JSON.stringify(responseBody),
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
