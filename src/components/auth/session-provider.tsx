'use client'

import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function NextAuthSesionProvider({
    children,
    session,
}: {
    children: React.ReactNode
    session: any
}): React.ReactNode {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 5, // 5 minutes
                retry: (failureCount, error: any) => {
                    // Don't retry on 401/403 errors
                    if (error?.status === 401 || error?.status === 403) {
                        return false
                    }
                    return failureCount < 3
                },
            },
        },
    }))

    return (
        <QueryClientProvider client={queryClient}>
            <SessionProvider
                session={session}
                refetchInterval={5 * 60} // Refetch session every 5 minutes
                refetchOnWindowFocus={true}
            >
                {children}
            </SessionProvider>
            {process.env.NODE_ENV === 'development' && (
                <ReactQueryDevtools initialIsOpen={false} />
            )}
        </QueryClientProvider>
    )
}
