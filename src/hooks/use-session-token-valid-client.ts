import { useSession } from 'next-auth/react'

import { isJWTTokenValid } from '@/lib/verify-token'

export function useSessionTokenValidClient() {
    const { data: session } = useSession()
    const isTokenValid = isJWTTokenValid(session?.access)

    return isTokenValid
}
