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
        console.error('[DEBUG] Login action exception occurred:')
        console.error('  - Error message:', error instanceof Error ? error.message : 'Unknown error')
        console.error('  - Error name:', error instanceof Error ? error.name : 'Unknown')
        console.error('  - Error stack:', error instanceof Error ? error.stack : 'No stack trace')
        console.error('  - Full error object:', error)

        // Re-throw with more descriptive error
        throw new Error(`Login failed: ${error instanceof Error ? error.message : 'Unknown error occurred'}`)
    }
}
