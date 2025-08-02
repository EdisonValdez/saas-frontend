import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function IndexPage() {
    try {
        // Use basic session check without external API validation
        const session = await auth()

        console.log('[DEBUG] Session check result:', session ? 'Session exists' : 'No session')
        console.log('[DEBUG] Session user:', session?.user ? 'User exists' : 'No user')

        if (session?.user?.email) {
            // User has a valid session, redirect to dashboard
            console.log('[DEBUG] Valid session found, redirecting to dashboard')
            redirect('/dashboard')
        } else {
            // No session found, redirect to login
            console.log('[DEBUG] No valid session, redirecting to login')
            redirect('/login')
        }
    } catch (error) {
        // If auth check fails, redirect to login as fallback
        console.log('[DEBUG] Auth check failed, redirecting to login:', error instanceof Error ? error.message : 'Unknown error')
        redirect('/login')
    }
}
