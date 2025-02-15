import { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { Subscription } from '@/types/subscriptions'
import { signIn } from '@/lib/auth'
import { getCurrentUserServer } from '@/lib/session'
import { fetchWorkspace } from '@/lib/workspace-details'
import { SubscriptionDetails } from '@/components/subscriptions/details'
import { determineUserRole } from '@/lib/roles-permissions'
import { hasPermission } from '@/lib/roles-permissions'
import { getSubscribableProductPrices } from '@/lib/pricing'
import { Pricing1 } from '@/components/marketing/blocks/pricing/pricing1'
import { UserDetails } from '@/types/auth'
import { NextAuthSesionProvider } from '@/components/auth/session-provider'
import { auth } from '@/lib/auth'

export const metadata: Metadata = {
    title: 'Settings',
    description: 'Manage account and workspace settings.',
}

export default async function SettingsPage(props: { params: Promise<{ workspaceId: string }> }) {
    const params = await props.params
    const user = await getCurrentUserServer()
    const session = await auth()

    // Step 1: Redirect to sign-in if the user is not authenticated
    if (!user) {
        redirect(await signIn())
    }

    // Step 2: Fetch the workspace details
    const workspace = await fetchWorkspace(params.workspaceId)

    const prices = await getSubscribableProductPrices()

    // Step 3: Handle workspace not found
    if (!workspace) {
        throw new Error('Workspace not found.')
    }

    // Step 4: Determine user role
    const userRole = determineUserRole(user, workspace)

    // Step 5: Render the page content
    return (
        <main className="p-4 sm:px-6 sm:py-0 md:gap-8">
            <div className="space-y-4 p-2 pt-3">
                <div className="space-y-2">
                    <p className="text-3xl font-bold tracking-tight">Manage workspace settings.</p>
                </div>
            </div>
            <div className="space-y-4 p-2 pt-6">
                {/* Conditional rendering based on manageSubscription permission */}
                {userRole && workspace.subscription && hasPermission(userRole, 'manageSubscription', 'workspace') && (
                    <SubscriptionDetails subscription={workspace.subscription as Subscription} />
                )}
            </div>
            <div className="space-y-4 p-2 pt-6">
                {userRole && !workspace.subscription && hasPermission(userRole, 'manageSubscription', 'workspace') && (
                    <NextAuthSesionProvider session={session}>
                        <Pricing1 prices={prices} user={user as UserDetails} />
                    </NextAuthSesionProvider>
                )}
            </div>
        </main>
    )
}
