import { getSession } from 'next-auth/react'
import { getApiURLWithEndpoint } from './utils'
import { siteConfig } from '@/config/site'

export interface AuthSession {
    user?: {
        id?: string
        email?: string
        name?: string
    }
    access?: string
    refresh?: string
    expires?: string
}

export interface AuthServiceResponse<T = any> {
    data?: T
    error?: string
    status: number
    success: boolean
}

class AuthService {
    private sessionCache: AuthSession | null = null
    private sessionExpiry: number = 0

    async getSession(): Promise<AuthSession | null> {
        // Check cache first
        if (this.sessionCache && Date.now() < this.sessionExpiry) {
            return this.sessionCache
        }

        try {
            // Try NextAuth session first
            const nextAuthSession = await getSession()

            if (nextAuthSession?.access && nextAuthSession?.refresh) {
                this.sessionCache = {
                    user: nextAuthSession.user,
                    access: nextAuthSession.access,
                    refresh: nextAuthSession.refresh,
                    expires: nextAuthSession.expires,
                }
                // Cache for 5 minutes
                this.sessionExpiry = Date.now() + 5 * 60 * 1000
                return this.sessionCache
            }

            // Fallback to API session endpoint
            const response = await fetch('/api/auth/session', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                return null
            }

            const sessionData = await response.json()
            this.sessionCache = sessionData
            this.sessionExpiry = Date.now() + 5 * 60 * 1000
            return sessionData
        } catch (error) {
            console.error('Error getting session:', error)
            return null
        }
    }

    async refreshSession(): Promise<AuthServiceResponse<AuthSession>> {
        try {
            const session = await this.getSession()
            if (!session?.refresh) {
                return {
                    error: 'No refresh token available',
                    status: 401,
                    success: false,
                }
            }

            const response = await fetch(getApiURLWithEndpoint(siteConfig.backend.api.auth.tokenRefresh), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refresh: session.refresh }),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                return {
                    error: errorData.detail || 'Failed to refresh token',
                    status: response.status,
                    success: false,
                }
            }

            const tokenData = await response.json()

            // Update cached session
            this.sessionCache = {
                ...session,
                access: tokenData.access,
                refresh: tokenData.refresh || session.refresh,
            }
            this.sessionExpiry = Date.now() + 5 * 60 * 1000

            return {
                data: this.sessionCache,
                status: 200,
                success: true,
            }
        } catch (error) {
            return {
                error: error instanceof Error ? error.message : 'Network error',
                status: 0,
                success: false,
            }
        }
    }

    async signOut(): Promise<AuthServiceResponse<void>> {
        try {
            // Clear cache
            this.sessionCache = null
            this.sessionExpiry = 0

            // Call NextAuth signOut
            const { signOut } = await import('next-auth/react')
            await signOut({ redirect: false })

            return {
                status: 200,
                success: true,
            }
        } catch (error) {
            return {
                error: error instanceof Error ? error.message : 'Sign out failed',
                status: 500,
                success: false,
            }
        }
    }

    async getAuthHeaders(): Promise<Record<string, string>> {
        const session = await this.getSession()
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        }

        if (session?.access) {
            headers.Authorization = `Bearer ${session.access}`
        }

        return headers
    }

    async isAuthenticated(): Promise<boolean> {
        const session = await this.getSession()
        return !!session?.access
    }

    async validateToken(token: string): Promise<boolean> {
        try {
            const response = await fetch(getApiURLWithEndpoint(siteConfig.backend.api.auth.tokenVerify), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            })

            return response.ok
        } catch (error) {
            console.error('Token validation error:', error)
            return false
        }
    }

    clearCache(): void {
        this.sessionCache = null
        this.sessionExpiry = 0
    }

    async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
        const headers = await this.getAuthHeaders()

        return fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                ...headers,
            },
        })
    }

    async fetchWithAuthJson<T = any>(url: string, options: RequestInit = {}): Promise<T> {
        const response = await this.fetchWithAuth(url, options)

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        return response.json()
    }
}

export const authService = new AuthService()

// Utility functions for easier usage
export async function getAuthenticatedHeaders(): Promise<Record<string, string>> {
    return authService.getAuthHeaders()
}

export async function requireAuth(): Promise<AuthSession> {
    const session = await authService.getSession()
    if (!session?.access) {
        throw new Error('Authentication required')
    }
    return session
}

export async function withAuth<T>(callback: (session: AuthSession) => Promise<T>): Promise<T> {
    const session = await requireAuth()
    return callback(session)
}
