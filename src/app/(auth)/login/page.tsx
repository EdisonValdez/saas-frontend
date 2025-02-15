'use client'

import { useSearchParams } from 'next/navigation'

import { UserLoginForm } from '@/components/auth/user-auth-form'

export default function LoginPage() {
    const searchParams = useSearchParams()
    const returnUrl = searchParams.get('callbackUrl') || '/dashboard'
    return <UserLoginForm returnUrl={returnUrl} />
}
