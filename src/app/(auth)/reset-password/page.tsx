import { Metadata } from 'next'

import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export const metadata: Metadata = {
    title: 'Reset Password',
    description: 'Update your password',
}

export default function ResetPasswordPage() {
    return <ResetPasswordForm />
}
