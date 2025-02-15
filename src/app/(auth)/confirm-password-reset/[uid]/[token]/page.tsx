import { Metadata } from 'next'

import { ConfirmPasswordResetForm } from '@/components/auth/confirm-password-reset-form'

export const metadata: Metadata = {
    title: 'Confirm Password Reset',
    description: 'Confirm to reset password',
}

export default function ConfirmPasswordResetPage() {
    return <ConfirmPasswordResetForm />
}
