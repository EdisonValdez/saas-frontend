'use server'

import { signOut } from '@/lib/auth'

export async function signOutAction() {
    const signOutResult = await signOut({
        redirectTo: '/',
    })
    return signOutResult
}
