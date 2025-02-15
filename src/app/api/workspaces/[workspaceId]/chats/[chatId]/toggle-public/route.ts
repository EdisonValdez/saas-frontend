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

// Toggle public chat
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

        const endpoint =
            getApiURLWithEndpoint(siteConfig.backend.api.workspaces.workspaces) +
            `${workspaceId}/chats/${chatId}/toggle_public/`

        // Make the POST request to the backend API
        const apiResponse = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${accessToken}`,
            },
            body: JSON.stringify({}),
        })

        if (!apiResponse.ok) {
            const errorDetails = await apiResponse.json()
            throw new Error(`API error with status ${apiResponse.status}: ${errorDetails}`)
        }

        const data: ChatSession = await apiResponse.json()
        return new Response(JSON.stringify(data), { status: apiResponse.status })
    } catch (error) {
        console.error('Failed to toggle public chat:', error)
        return new Response(JSON.stringify({ error: 'Failed to toggle public chat' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }
}
