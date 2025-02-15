import { siteConfig } from '@/config/site'
import { getApiURLWithEndpoint } from './utils'

export async function refreshToken(refreshToken: string): Promise<{ access: string; refresh: string }> {
    const TokenRefreshEndpoint = getApiURLWithEndpoint(siteConfig.backend.api.auth.tokenRefresh)

    try {
        // Send a request to refresh the token
        const res = await fetch(TokenRefreshEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
        })

        if (!res.ok) {
            const error = await res.json().catch(() => ({})) // Try to parse error body
            // console.error('Failed to refresh token:', res.status, error)
            throw new Error('Failed to refresh token', error)
        }

        const tokens = await res.json()

        // Log the response to debug unexpected token formats
        // console.log('Token refresh response:', tokens)

        if (!tokens.access) {
            throw new Error('Access token missing in refresh response')
        }

        // If refresh token is not returned, reuse the existing one
        return {
            access: tokens.access,
            refresh: tokens.refresh || refreshToken, // Fallback to the current refresh token
        }
    } catch (error) {
        // console.error('Error refreshing token:', error)
        throw new Error('Unable to refresh token')
    }
}
