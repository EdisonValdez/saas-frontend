import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'

import { dashboardConfig } from '@/config/dashboard'

import { UserDetails } from '@/types/auth'
import { Workspace } from '@/types/workspaces'

import { signIn } from '@/lib/auth'

import { getCurrentUserServer } from '@/lib/session'
import { getUserWorkspaces } from '@/lib/user-workspaces'

import { SubscriptionDetails } from '@/components/subscriptions/details'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DashboardMainNav } from '@/components/dashboard/main-nav'

export const metadata: Metadata = {
    title: 'Billing',
    description: 'Manage your subscription and billing information.',
}

export default async function BillingPage() {
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
                    <h1 className="text-3xl font-semibold">Subscriptions</h1>
                </div>
                <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
                    <nav className="grid gap-4 text-sm text-muted-foreground">
                        <Link href="/dashboard/billing" className="font-semibold text-primary">
                            All Subscriptions
                        </Link>
                    </nav>
                    <div className="grid gap-6">
                        <div className="grid gap-8">
                            {workspaces && workspaces.length > 0 ? (
                                workspaces.map((workspace) => (
                                    <Card key={workspace.id} className="w-max">
                                        <CardHeader>
                                            <CardTitle>{workspace.name}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <SubscriptionDetails subscription={workspace.subscription} />
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <Card className="w-max">
                                    <CardHeader>
                                        <CardTitle>No Workspaces Found</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">
                                            You don't have any workspaces yet. Create a workspace to get started.
                                        </p>
                                        <Link href="/dashboard/workspaces" className="inline-block mt-4">
                                            <Button variant="default">Create Workspace</Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
