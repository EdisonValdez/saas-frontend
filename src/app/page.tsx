import { redirect } from 'next/navigation'
import { getCurrentUserServer } from '@/lib/session'

export default async function IndexPage() {
    try {
        const user = await getCurrentUserServer()
        if (user) {
            // User is authenticated, redirect to dashboard
            redirect('/dashboard')
        } else {
            // User is not authenticated, redirect to login
            redirect('/login')
        }
    } catch (error) {
        // If auth check fails, redirect to login as fallback
        console.log('Auth check failed, redirecting to login:', error)
        redirect('/login')
    }
}
