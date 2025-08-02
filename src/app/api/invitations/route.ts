import { siteConfig } from '@/config/site'
import { getAccessToken } from '@/lib/get-access-token'
import { getApiURLWithEndpoint } from '@/lib/utils'
import { invitationSchema } from '@/lib/validations/workspace'
import { isJWTTokenValid } from '@/lib/verify-token'

export async function POST(req: Request) {
    const accessToken = await getAccessToken()

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

        const apiResponse = await fetch(INVITATION_CREATE_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${accessToken}`,
            },
            body: JSON.stringify(invitation),
        })

        if (!apiResponse.ok) {
            const errorDetails = await apiResponse.json()
            throw new Error(`API error with status ${apiResponse.status}: ${errorDetails.message || 'Unknown error'}`)
        }

        const data = await apiResponse.json()
        return new Response(JSON.stringify(data), {
            status: apiResponse.status,
            headers: { 'Content-Type': 'application/json' },
        })
    } catch (error) {
        console.error('Invitation Error:', error)
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }
}
