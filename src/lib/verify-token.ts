import { auth } from '@/lib/auth'

import { siteConfig } from '@/config/site'

import { getApiURLWithEndpoint } from './utils'

export async function isJWTTokenValid(token: string | undefined) {
    const verificationBody = {
        token: token,
    }

    const TokenVerifyEndpoint = getApiURLWithEndpoint(siteConfig.backend.api.auth.tokenVerify)

    try {
        const verificationRes = await fetch(TokenVerifyEndpoint, {
            headers: new Headers({
                'Content-Type': 'application/json',
            }),
            method: 'POST',
            body: JSON.stringify(verificationBody),
        })
        if (verificationRes.status === 200) {
            return true
        }
    } catch (error) {
        return false
    }
}

export async function sessionTokenIsValidServer() {
    const session = await auth()
    const isTokenValid = await isJWTTokenValid(session?.access)
    return isTokenValid
}
