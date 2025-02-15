import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import { signIn } from '@/lib/auth'

import { getCurrentUserServer } from '@/lib/session'
import { UserDetails } from '@/types/auth'

export const metadata: Metadata = {
    title: 'Dashboard',
    description: 'Your app dashboard',
}

interface DashboardLayoutProps {
    children?: React.ReactNode
}

export default async function Dashboard({ children }: DashboardLayoutProps) {
    const user = (await getCurrentUserServer()) as UserDetails

    if (!user) {
        redirect(await signIn('/dashboard'))
    }

    return (
        <div className="flex min-h-screen w-full flex-col">
            <div>{children}</div>
        </div>
    )
}
