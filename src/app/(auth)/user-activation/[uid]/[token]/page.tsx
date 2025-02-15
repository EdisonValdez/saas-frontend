import { Metadata } from 'next'

import { UserActivationForm } from '@/components/auth/user-activation-form'

export const metadata: Metadata = {
    title: 'Reset Username',
    description: 'Update your username',
}

export default function UserActivationPage() {
    return <UserActivationForm />
}
