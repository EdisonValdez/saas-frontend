import * as z from 'zod'

import { siteConfig } from '@/config/site'
import { getAccessToken } from '@/lib/get-access-token'
import { getApiURLWithEndpoint } from '@/lib/utils'
import { invitationSchema } from '@/lib/validations/workspace'
import { isJWTTokenValid } from '@/lib/verify-token'

const routeContextSchema = z.object({
    params: z.object({
        workspaceId: z.string(),
        teamId: z.string(),
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
        const invitation = invitationSchema.parse(body)
        const INVITATION_CREATE_ENDPOINT = getApiURLWithEndpoint(siteConfig.backend.api.workspaces.invitations)
        const responseBody = invitationSchema.parse({
            email: invitation.email,
            role: invitation.role,
            team: params.teamId,
        })
        const res = await fetch(INVITATION_CREATE_ENDPOINT, {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/json',
                Authorization: `JWT ${accessToken}`,
            }),
            body: JSON.stringify(responseBody),
        })
        const data = await res.json()
        return new Response(JSON.stringify(data), { status: res.status })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response(JSON.stringify(error.issues), { status: 422 })
        }
        return new Response(null, { status: 500 })
    }
}
