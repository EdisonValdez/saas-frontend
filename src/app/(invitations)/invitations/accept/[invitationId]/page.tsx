import { redirect } from 'next/navigation'

import { signIn } from '@/lib/auth'
import { getCurrentUserServer } from '@/lib/session'

import { UserLoginForm } from '@/components/auth/user-auth-form'
import { InvitationAccept } from '@/components/common/invitation-accept'

export default async function InvitationPage({ params }: { params: { invitationId: string } }) {
    const user = await getCurrentUserServer()

    if (!user) {
        redirect(await signIn())
    }

    return (
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
            <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
                {!user && <UserLoginForm returnUrl={`/invitations/accept/${params.invitationId}`} />}
                {user && <InvitationAccept invitationId={params.invitationId} />}
            </div>
        </section>
    )
}
