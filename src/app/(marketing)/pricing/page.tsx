import { UserDetails } from '@/types/auth'

import { auth } from '@/lib/auth'
import { getSubscribableProductPrices } from '@/lib/pricing'
import { getCurrentUserServer } from '@/lib/session'
import { getUserWorkspaces } from '@/lib/user-workspaces'

import { NextAuthSesionProvider } from '@/components/auth/session-provider'
import { Pricing1 } from '@/components/marketing/blocks/pricing/pricing1'

export default async function PricingPage() {
    const userData = await getCurrentUserServer()
    const userWorkspacesData = await getUserWorkspaces()
    const session = await auth()

    const [user, userWorkspaces] = await Promise.all([userData, userWorkspacesData])
    const userDetails = {
        ...user,
        workspaces: userWorkspaces,
    }

    const prices = await getSubscribableProductPrices()
    return (
        <>
            <NextAuthSesionProvider session={session}>
                <Pricing1 prices={prices} user={userDetails as UserDetails} />
            </NextAuthSesionProvider>
        </>
    )
}
