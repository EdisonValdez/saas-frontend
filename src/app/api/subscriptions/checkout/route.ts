/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'

import { siteConfig } from '@/config/site'
import { getAccessToken } from '@/lib/get-access-token'
import { getApiURL } from '@/lib/utils'
import { isJWTTokenValid } from '@/lib/verify-token'

export async function POST(request: Request) {
    if (request.method === 'POST') {
        let userDetailData: any

        //Get price id from the body
        const body = await request.json()
        //Get user default workspace id from backend
        const accessToken = await getAccessToken()

        // If there is a session, we verify the token and update the config headers
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
        const USER_DETAIL_END_POINT = url.concat(siteConfig.backend.api.auth.userDetails)
        try {
            const userDetailResponse = await fetch(USER_DETAIL_END_POINT, {
                headers: new Headers({
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                }),
            })
            userDetailData = await userDetailResponse.json()
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

        const CHECKOUT_ENDPOINT = url.concat(siteConfig.backend.api.subscriptions.checkout)

        let checkoutBody: any
        if (body.workspace_id) {
            checkoutBody = {
                workspace_id: body.workspace_id,
                price_id: body.price_id,
            }
        } else {
            checkoutBody = {
                workspace_id: userDetailData.workspaces[0].id,
                price_id: body.price_id,
            }
        }

        //Call backend to get the Stripe session ID
        try {
            const checkoutResponse = await fetch(CHECKOUT_ENDPOINT, {
                method: 'POST',
                headers: new Headers({
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                }),
                body: JSON.stringify(checkoutBody),
            })
            if (checkoutResponse.status === 200) {
                const checkoutResponseData = await checkoutResponse.json()
                return new Response(JSON.stringify(checkoutResponseData), {
                    status: checkoutResponse.status,
                })
            } else {
                const checkoutResponseData = await checkoutResponse.json()
                return new Response(JSON.stringify({ error: checkoutResponseData }), {
                    status: checkoutResponse.status,
                })
            }
        } catch (error) {
            console.error('Error in checkout', error)
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
