/* eslint-disable @typescript-eslint/no-unused-vars */
import * as z from 'zod'

import { siteConfig } from '@/config/site'
import { validateAccessToken, getAccessToken } from '@/lib/get-access-token'
import { getApiURLWithEndpoint } from '@/lib/utils'
import { workspaceSchema } from '@/lib/validations/workspace'
import { isJWTTokenValid } from '@/lib/verify-token'

// GET /api/workspaces
// Get all workspaces for the authenticated user
export async function GET(request: Request) {
    const accessToken = await getAccessToken()

    // this is a redundant check if using middleware
    if (!accessToken || !(await isJWTTokenValid(accessToken))) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    const WORKSPACES_ENDPOINT = getApiURLWithEndpoint(siteConfig.backend.api.workspaces.workspaces)

    try {
        const apiResponse = await fetch(WORKSPACES_ENDPOINT, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${accessToken}`,
            },
            method: 'GET',
        })

        if (!apiResponse.ok) {
            const errorDetails = await apiResponse.json()
            throw new Error(`API error with status ${apiResponse.status}: ${errorDetails}`)
        }

        const data = await apiResponse.json()
        return new Response(JSON.stringify(data), { status: apiResponse.status })
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
        })
    }
}

// POST /api/workspaces
// Create a new workspace
export async function POST(req: Request) {
    const accessTokenOrError = await validateAccessToken()

    if (accessTokenOrError instanceof Response) {
        return accessTokenOrError // Return the unauthorized response directly
    }

    const accessToken = accessTokenOrError // Now we have a valid access token string

    try {
        const body = await req.json()
        const workspace = workspaceSchema.parse(body)

        const payload = {
            name: workspace.name,
            ...(workspace.slug && { slug: workspace.slug }),
            ...(workspace.status && { status: workspace.status }),
        }

        const WORKSPACES_ENDPOINT = getApiURLWithEndpoint(siteConfig.backend.api.workspaces.workspaces)

        const apiResponse = await fetch(WORKSPACES_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `JWT ${accessToken}`,
            },
            body: JSON.stringify(payload),
        })

        if (!apiResponse.ok) {
            const errorDetails = await apiResponse.json()
            return new Response(
                JSON.stringify({
                    error: `API error with status ${apiResponse.status}`,
                    details: errorDetails,
                }),
                {
                    status: apiResponse.status,
                    headers: { 'Content-Type': 'application/json' },
                }
            )
        }

        const data = await apiResponse.json()

        return new Response(JSON.stringify(data), {
            status: apiResponse.status,
            headers: { 'Content-Type': 'application/json' },
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response(
                JSON.stringify({
                    error: 'Validation failed',
                    details: error.issues,
                }),
                {
                    status: 422,
                    headers: { 'Content-Type': 'application/json' },
                }
            )
        }

        return new Response(
            JSON.stringify({
                error: 'Internal Server Error',
                message: error instanceof Error ? error.message : 'Unknown error',
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        )
    }
}
