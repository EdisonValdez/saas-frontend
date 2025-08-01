'use client'

import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { PromptaxNavbar } from './promptax-navbar'

export function ConditionalNavbar() {
    const { status } = useSession()
    const pathname = usePathname()
    
    // Routes where navbar should be hidden completely
    const hideNavbarRoutes = [
        '/login',
        '/register',
        '/reset-password',
        '/reset-username',
        '/resend-activation',
        '/confirm-password-reset',
        '/confirm-username-reset',
        '/user-activation'
    ]
    
    // Check if current route should hide navbar
    const shouldHideNavbar = hideNavbarRoutes.some(route => pathname.startsWith(route))
    
    // Hide navbar on auth pages and when user is authenticated (dashboard has its own navigation)
    if (shouldHideNavbar || status === 'authenticated') {
        return null
    }
    
    // Show navbar for unauthenticated users on marketing pages
    return <PromptaxNavbar />
}
