import * as z from 'zod'

import { siteConfig } from '@/config/site'
import { getAccessToken } from '@/lib/get-access-token'
import { getApiURLWithEndpoint } from '@/lib/utils'
import { workspaceSchema } from '@/lib/validations/workspace'
import { isJWTTokenValid } from '@/lib/verify-token'

const routeContextSchema = z.object({
    params: z.object({
        workspaceId: z.string(),
    }),
})

// PUT /api/workspaces/[workspaceId]
// Update a workspace
export async function PUT(req: Request, context: z.infer<typeof routeContextSchema>) {
    const accessToken = await getAccessToken()

    // this is a redundant check if using middleware
    if (!accessToken || !(await isJWTTokenValid(accessToken))) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    const { params } = routeContextSchema.parse(context)

    try {
        // Validate the request body against the workspace schema
        const body = await req.json()
        const workspace = workspaceSchema.parse(body)

        // Prepare the request payload
        const payload = {
            name: workspace.name,
            ...(workspace.slug && { slug: workspace.slug }),
            ...(workspace.status && { status: workspace.status }),
        }

        const WORKSPACE_ENDPOINT = getApiURLWithEndpoint(
            `${siteConfig.backend.api.workspaces.workspaces}${params.workspaceId}/`
        )

        // Make the POST request to the backend API
        const apiResponse = await fetch(WORKSPACE_ENDPOINT, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(payload),
        })

        if (!apiResponse.ok) {
            const errorDetails = await apiResponse.json()
            throw new Error(`API error with status ${apiResponse.status}: ${errorDetails}`)
        }

        const data = await apiResponse.json()

        return new Response(JSON.stringify(data), {
            status: apiResponse.status,
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

// DELETE /api/workspaces/[workspaceId]
// Delete a workspace
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
    const WORKSPACE_ENDPOINT = getApiURLWithEndpoint(
        `${siteConfig.backend.api.workspaces.workspaces}${params.workspaceId}/`
    )

    try {
        // No need to parse the body for a DELETE request
        const apiResponse = await fetch(WORKSPACE_ENDPOINT, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${await getAccessToken()}`, // Simplified for example purposes
            },
        })

        if (!apiResponse.ok) {
            const errorDetails = await apiResponse.json()
            throw new Error(`API error with status ${apiResponse.status}: ${errorDetails}`)
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
