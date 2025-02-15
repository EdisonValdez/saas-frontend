import { Metadata } from 'next'

import { UserRegisterForm } from '@/components/auth/user-register-form'

export const metadata: Metadata = {
    title: 'Register',
    description: 'Register an account',
}

export default function RegisterPage() {
    return <UserRegisterForm />
}
