import { Metadata } from 'next'

import { ConfirmUsernameResetForm } from '@/components/auth/confirm-username-reset-form'

export const metadata: Metadata = {
    title: 'Confirm Username Reset',
    description: 'Confirm to reset username',
}

export default function ConfirmUsernameResetPAge() {
    return <ConfirmUsernameResetForm />
}
