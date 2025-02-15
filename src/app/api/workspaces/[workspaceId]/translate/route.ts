import * as z from 'zod'
import { siteConfig } from '@/config/site'
import { getAccessToken } from '@/lib/get-access-token'
import { getApiURLWithEndpoint } from '@/lib/utils'
import { isJWTTokenValid } from '@/lib/verify-token'

// Define the route context schema (parameters from the URL)
const routeContextSchema = z.object({
    params: z.object({
        workspaceId: z.string(),
    }),
})

// POST handler for translation
export async function POST(request: Request, context: z.infer<typeof routeContextSchema>) {
    const accessToken = await getAccessToken()

    // Check if the token is valid (authentication)
    if (!accessToken || !(await isJWTTokenValid(accessToken))) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    // Parse the route context (workspaceId)
    const { params } = routeContextSchema.parse(context)
    const workspaceId = params.workspaceId

    // Parse and validate the request body
    const body = await request.json()

    // Construct the API endpoint to call the translation service
    const endpoint = getApiURLWithEndpoint(siteConfig.backend.api.workspaces.workspaces) + `${workspaceId}/translate/`

    try {
        // Make the request to the translation API
        const apiResponse = await fetch(endpoint, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${accessToken}`,
            },
            method: 'POST',
            body: JSON.stringify(body), // Send the body directly
        })

        if (!apiResponse.ok) {
            const errorDetails = await apiResponse.json()
            console.error('API response error:', errorDetails) // For debugging
            return new Response(JSON.stringify({ error: `API error: ${errorDetails.message}` }), {
                status: apiResponse.status,
                headers: { 'Content-Type': 'application/json' },
            })
        }

        const translationData = await apiResponse.json()

        // Return the translation result to the client
        return new Response(JSON.stringify({ translation: translationData.translated_text }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        })
    } catch (error) {
        console.error('Translation failed:', error) // Log error for debugging
        return new Response(JSON.stringify({ error: 'Translation failed. Please try again later.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }
}
