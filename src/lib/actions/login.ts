'use server'

import { signIn } from '@/lib/auth'

export async function loginAction(data: any, redirectUrl?: string) {
    const callbackUrl = redirectUrl || '/dashboard'

    try {

        const signInResult = await signIn('credentials', {
            email: data.email,
            password: data.password,
            redirect: false,
            callbackUrl: callbackUrl,
        })

        if (signInResult?.error) {
            return signInResult
        }

        // For successful signin, NextAuth returns url instead of error
        if (signInResult?.url || signInResult?.ok !== false) {
            return { ok: true, url: signInResult?.url || callbackUrl }
        }

        return signInResult
    } catch (error) {
        throw new Error(`Login failed: ${error instanceof Error ? error.message : 'Unknown error occurred'}`)
    }
}
