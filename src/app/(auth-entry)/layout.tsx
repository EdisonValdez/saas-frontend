import { NextAuthSesionProvider } from '@/components/auth/session-provider'
import { auth } from '@/lib/auth'

interface AuthEntryLayoutProps {
    children: React.ReactNode
}

export default async function AuthEntryLayout({ children }: AuthEntryLayoutProps) {
    const session = await auth()

    return (
        <NextAuthSesionProvider session={session}>
            {children}
        </NextAuthSesionProvider>
    )
}
