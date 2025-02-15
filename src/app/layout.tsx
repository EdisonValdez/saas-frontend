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
        icon: '/favicon.ico',
        shortcut: '/favicon-16x16.png',
        apple: '/apple-touch-icon.png',
    },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head />
            <body className={cn('min-h-screen bg-background font-sans antialiased', fontSans.variable)}>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    {children}
                    <Toaster />
                    <TailwindIndicator />
                </ThemeProvider>
            </body>
        </html>
    )
}
