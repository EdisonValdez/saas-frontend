import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function IndexPage() {
    try {
        // Use basic session check without external API validation
        const session = await auth()

        console.log('[DEBUG] Session check result:', session ? 'Session exists' : 'No session')
        console.log('[DEBUG] Session user:', session?.user ? 'User exists' : 'No user')
        console.log('[DEBUG] Session user email:', session?.user?.email || 'No email')

        if (session?.user?.email) {
            // User has a valid session, redirect to dashboard
            console.log('[DEBUG] Valid session found, redirecting to dashboard')
            redirect('/dashboard')
        }
    } catch (error) {
        // If auth check fails, redirect to login as fallback
        console.log('[DEBUG] Auth check failed, details:', error)
        // Don't throw error, just continue to login redirect
    }

    // No session found or error occurred, redirect to login
    console.log('[DEBUG] No valid session, redirecting to login')
    redirect('/login')
}
