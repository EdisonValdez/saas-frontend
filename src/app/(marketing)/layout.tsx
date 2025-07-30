'use server'

import { NextAuthSesionProvider } from '@/components/auth/session-provider'
import { marketingConfig } from '@/config/marketing'
import { auth } from '@/lib/auth'
import { Header1 } from '@/components/marketing/blocks/header/header1'
import { Footer1 } from '@/components/marketing/blocks/footer/footer1'

interface MarketingLayoutProps {
    children: React.ReactNode
}

export default async function MarketingLayout({ children }: MarketingLayoutProps) {
    const session = await auth()

    return (
        <div className="flex min-h-screen flex-col">
            <NextAuthSesionProvider session={session}>
                {/* Only show header/footer for non-home pages */}
                {/* Our main page now handles its own layout completely */}
                <main className="flex-1">{children}</main>
            </NextAuthSesionProvider>
        </div>
    )
}
