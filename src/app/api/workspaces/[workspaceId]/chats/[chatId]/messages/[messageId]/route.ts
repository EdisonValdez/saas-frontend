import * as z from 'zod'

import { siteConfig } from '@/config/site'
import { getAccessToken } from '@/lib/get-access-token'
import { getApiURLWithEndpoint } from '@/lib/utils'
import { isJWTTokenValid } from '@/lib/verify-token'
import { chatMessagePayloadSchema } from '@/lib/validations/chat'

const routeContextSchema = z.object({
    params: z.object({
        workspaceId: z.string(),
        chatId: z.string(),
        messageId: z.string(),
    }),
})

//PUT an existing chat message
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
        const { role, content } = chatMessagePayloadSchema.parse(await req.json())
        const { workspaceId, chatId, messageId } = params

        // Prepare the request payload
        const payload = {
            role,
            content,
        }

        const endpoint =
            getApiURLWithEndpoint(siteConfig.backend.api.workspaces.workspaces) +
            `${workspaceId}/chats/${chatId}/messages/${messageId}/`

        // Make the PUT request to the backend API
        const apiResponse = await fetch(endpoint, {
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
