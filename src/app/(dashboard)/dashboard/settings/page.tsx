import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'

import { dashboardConfig } from '@/config/dashboard'

import { UserDetails } from '@/types/auth'
import { Workspace } from '@/types/workspaces'

import { signIn } from '@/lib/auth'

import { getCurrentUserServer } from '@/lib/session'
import { getUserWorkspaces } from '@/lib/user-workspaces'

import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'
import { ResetUsernameForm } from '@/components/auth/reset-username-form'
import { BillingSection } from '@/components/subscriptions/billing-section'
import { DashboardMainNav } from '@/components/dashboard/main-nav'

export const metadata: Metadata = {
    title: 'Settings',
    description: 'Manage account and website settings.',
}

export default async function SettingsPage() {
    const userData = (await getCurrentUserServer()) as UserDetails
    const workspacesData = (await getUserWorkspaces()) as Workspace[]

    const [user, workspaces] = await Promise.all([userData, workspacesData])

    if (!user) {
        redirect(await signIn())
    }

    if (!workspaces) {
        redirect('/dashboard')
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <DashboardMainNav items={dashboardConfig.mainNav} workspaces={workspaces} user={user} />
            <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
                <div className="mx-auto grid w-full max-w-6xl gap-2">
                    <h1 className="text-3xl font-semibold">Settings</h1>
                </div>
                <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
                    <nav className="grid gap-4 text-sm text-muted-foreground">
                        <Link href="/dashboard/settings" className="font-semibold text-primary">
                            General
                        </Link>
                    </nav>
                    <div className="grid gap-6">
                        <Card>
                            <CardHeader>
                                <CardDescription>
                                    Follow the instruction in the email to reset your password.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResetPasswordForm />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardDescription>
                                    Follow the instruction in the email to reset your user name.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResetUsernameForm />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}
