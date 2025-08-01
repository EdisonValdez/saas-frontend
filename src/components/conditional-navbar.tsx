'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { PromptaxNavbar } from './promptax-navbar'

export function ConditionalNavbar() {
    const { status } = useSession()
    const pathname = usePathname()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

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

    // Don't render until mounted to avoid hydration mismatch
    if (!mounted) {
        return <div className="h-16" /> // Placeholder to prevent layout shift
    }

    // Hide navbar on auth pages and when user is authenticated (dashboard has its own navigation)
    if (shouldHideNavbar || status === 'authenticated') {
        return null
    }

    // Show navbar for unauthenticated users on marketing pages
    return (
        <>
            <PromptaxNavbar />
            <div className="h-16" /> {/* Spacer for fixed navbar */}
        </>
    )
}
