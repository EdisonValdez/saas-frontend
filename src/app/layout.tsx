// Global styles
import '@/styles/globals.css'

// Types
import { Metadata, Viewport } from 'next'

// Configurations
import { siteConfig } from '@/config/site'

// Utility functions
import { cn } from '@/lib/utils'
import { fontSans } from '@/lib/fonts'

// UI Components
import { Toaster } from '@/components/ui/toaster'
import { TailwindIndicator } from '@/components/tailwind-indicator'
import { ThemeProvider } from '@/components/theme-provider'
import { PromptaxNavbar } from '@/components/promptax-navbar'
import { NextAuthSesionProvider } from '@/components/auth/session-provider'

// Authentication
import { auth } from '@/lib/auth'

export const viewport: Viewport = {
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: 'white' },
        { media: '(prefers-color-scheme: dark)', color: 'black' },
    ],
}

export const metadata: Metadata = {
    title: {
        default: siteConfig.name,
        template: `%s - ${siteConfig.name}`,
    },
    description: siteConfig.description,

    icons: {
        icon: '/favicon.svg',
        shortcut: '/favicon.svg',
        apple: '/favicon.svg',
    },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const session = await auth()

    return (
        <html lang="en" suppressHydrationWarning>
            <head />
            <body
                className={cn('min-h-screen bg-background font-sans antialiased', fontSans.variable)}
                suppressHydrationWarning
            >
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    <NextAuthSesionProvider session={session}>
                        <PromptaxNavbar />
                        <main className="pt-16">
                            {children}
                        </main>
                        <Toaster />
                        <TailwindIndicator />
                    </NextAuthSesionProvider>
                </ThemeProvider>
            </body>
        </html>
    )
}
