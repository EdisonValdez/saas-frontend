'use server'

import { signIn } from '@/lib/auth'

export async function loginAction(data: any, redirectUrl?: string) {
    const callbackUrl = redirectUrl || '/dashboard'
    try {
        const signInResult = await signIn('credentials', {
            ...data,
            redirect: false,
            callbackUrl: callbackUrl,
        })
        return signInResult
    } catch (error) {
        // return null
        throw new Error('An error occurred while logging in.')
    }
}
