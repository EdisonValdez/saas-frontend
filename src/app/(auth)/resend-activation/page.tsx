import { Metadata } from 'next'

import { ResendActivationLinkForm } from '@/components/auth/resend-activation-link-form'

export const metadata: Metadata = {
    title: 'Resend Activation',
    description: 'Resend activation link to you',
}

export default function ResendActivationPage() {
    return <ResendActivationLinkForm />
}
