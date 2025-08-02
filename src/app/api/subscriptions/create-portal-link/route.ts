/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'

import { siteConfig } from '@/config/site'
import { getAccessToken } from '@/lib/get-access-token'
import { getApiURL } from '@/lib/utils'
import { isJWTTokenValid } from '@/lib/verify-token'

export async function POST(request: Request) {
    if (request.method === 'POST') {
        const accessToken = await getAccessToken()

        if (accessToken) {
            const isTokenValid = await isJWTTokenValid(accessToken)
            if (!isTokenValid) {
                return new NextResponse(
                    JSON.stringify({
                        error: 'Please login again.',
                    }),
                    {
                        status: 500,
                    }
                )
            }
        }

        const url = getApiURL()

        const CREATE_CUSTOMER_PORTAL_LINK = url.concat(siteConfig.backend.api.subscriptions.billingPortal)

        try {
            const billingPortalResponse = await fetch(CREATE_CUSTOMER_PORTAL_LINK, {
                headers: new Headers({
                    'Content-Type': 'application/json',
                    Authorization: `JWT ${accessToken}`,
                }),
                method: 'POST',
            })
            const billingPortalData = await billingPortalResponse.json()
            return new Response(JSON.stringify(billingPortalData), {
                status: billingPortalResponse.status,
            })
        } catch (error) {
            return new NextResponse(
                JSON.stringify({
                    error: 'An error happened. Please try again.',
                }),
                {
                    status: 500,
                }
            )
        }
    } else {
        return new NextResponse('Method Not Allowed', {
            headers: { Allow: 'GET' },
            status: 405,
        })
    }
}
