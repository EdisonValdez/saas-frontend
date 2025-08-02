'use server'

import { signIn } from '@/lib/auth'

export async function loginAction(data: any, redirectUrl?: string) {
    const callbackUrl = redirectUrl || '/dashboard'

    try {
        console.log('[DEBUG] Login attempt initiated for email:', data.email)
        console.log('[DEBUG] Callback URL:', callbackUrl)
        console.log('[DEBUG] Environment check:')
        console.log('  - AUTH_SECRET exists:', !!process.env.AUTH_SECRET)
        console.log('  - NEXTAUTH_SECRET exists:', !!process.env.NEXTAUTH_SECRET)
        console.log(
            '  - NEXT_PUBLIC_BACKEND_API_URL:',
            process.env.NEXT_PUBLIC_BACKEND_API_URL || 'Not set (will use default)'
        )
        console.log('  - NODE_ENV:', process.env.NODE_ENV)

        const signInResult = await signIn('credentials', {
            ...data,
            redirect: false,
            callbackUrl: callbackUrl,
        })

        console.log('[DEBUG] SignIn result received:', signInResult)

        if (signInResult?.error) {
            console.error('[DEBUG] SignIn error details:', signInResult.error)
            console.error('[DEBUG] Full signIn result:', JSON.stringify(signInResult, null, 2))
            return signInResult
        }

        // For successful signin, NextAuth returns url instead of error
        if (signInResult?.url || signInResult?.ok !== false) {
            console.log('[DEBUG] SignIn appears successful')
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
