import { Metadata } from 'next'

import { ResetUsernameForm } from '@/components/auth/reset-username-form'

export const metadata: Metadata = {
    title: 'Reset Username',
    description: 'Update your username',
}

export default function ResetUsernamePage() {
    return <ResetUsernameForm />
}
