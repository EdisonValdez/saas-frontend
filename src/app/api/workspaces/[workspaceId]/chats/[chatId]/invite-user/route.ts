import * as z from 'zod'

import { siteConfig } from '@/config/site'
import { getAccessToken } from '@/lib/get-access-token'
import { getApiURLWithEndpoint } from '@/lib/utils'
import { isJWTTokenValid } from '@/lib/verify-token'
import { ChatSession } from '@/types/chat'

const routeContextSchema = z.object({
    params: z.object({
        workspaceId: z.string(),
        chatId: z.string(),
    }),
})

//POST add user to chat
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
        const { workspaceId, chatId } = params
        const email = await req.json()

        const endpoint =
            getApiURLWithEndpoint(siteConfig.backend.api.workspaces.workspaces) +
            `${workspaceId}/chats/${chatId}/invite_user/`

        // Make the POST request to the backend API
        const apiResponse = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${accessToken}`,
            },
            body: JSON.stringify(email),
        })

        if (!apiResponse.ok) {
            const errorDetails = await apiResponse.json()
            throw new Error(`API error with status ${apiResponse.status}: ${errorDetails}`)
        }

        const data: ChatSession = await apiResponse.json()
        return new Response(JSON.stringify(data), { status: apiResponse.status })
    } catch (error) {
        console.error('Failed to add user to chat:', error)
        return new Response(JSON.stringify({ error: 'Failed to add user to chat' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }
}
