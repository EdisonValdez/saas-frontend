import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function IndexPage() {
    try {
        // Use basic session check without external API validation
        const session = await auth()

        if (session?.user) {
            // User has a valid session, redirect to dashboard
            redirect('/dashboard')
        } else {
            // No session found, redirect to login
            redirect('/login')
        }
    } catch (error) {
        // If auth check fails, redirect to login as fallback
        console.log('Auth check failed, redirecting to login')
        redirect('/login')
    }
}
