import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

import type { Provider } from 'next-auth/providers'

import { getApiURL } from './utils'
import { userLoginSchema } from './validations/auth'

const providers: Provider[] = [
    Credentials({
        name: 'Credentials',
        credentials: {
            email: {
                label: 'Email',
                type: 'text',
                placeholder: 'jsmith@gmail.com',
            },
            password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials, req) {
            console.log('[DEBUG] Authorize method called with email:', credentials?.email)

            const { email, password } = userLoginSchema.parse(credentials)

            if (!credentials?.email || !credentials?.password) {
                console.error('[DEBUG] Email and password are required')
                return null
            }

            const BACKEND_URL = getApiURL()
            const USER_LOGIN_ENDPOINT = BACKEND_URL.concat('/auth/jwt/create/')
            const USER_DETAILS_ENDPOINT = BACKEND_URL.concat('/auth/users/me/')

            console.log('[DEBUG] Authentication endpoints:')
            console.log('  - Backend URL:', BACKEND_URL)
            console.log('  - Login endpoint:', USER_LOGIN_ENDPOINT)
            console.log('  - User details endpoint:', USER_DETAILS_ENDPOINT)

            try {
                console.log('[DEBUG] Attempting to fetch JWT tokens...')

                // Fetch JWT tokens
                const jwtRes = await fetch(USER_LOGIN_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                })

                console.log('[DEBUG] JWT response status:', jwtRes.status, jwtRes.statusText)

                if (!jwtRes.ok) {
                    const errorText = await jwtRes.text()
                    console.error('[DEBUG] Failed to fetch tokens:', jwtRes.statusText)
                    console.error('[DEBUG] Error response body:', errorText)
                    return null
                }

                const jwtTokens = await jwtRes.json()
                console.log('[DEBUG] JWT tokens received successfully')

                console.log('[DEBUG] Attempting to fetch user details...')

                // Fetch user details
                const userDetailsRes = await fetch(USER_DETAILS_ENDPOINT, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `JWT ${jwtTokens.access}`,
                    },
                })

                console.log('[DEBUG] User details response status:', userDetailsRes.status, userDetailsRes.statusText)

                if (!userDetailsRes.ok) {
                    const errorText = await userDetailsRes.text()
                    console.error('[DEBUG] Failed to fetch user details:', userDetailsRes.statusText)
                    console.error('[DEBUG] Error response body:', errorText)
                    return null
                }

                const userDetails = await userDetailsRes.json()
                console.log('[DEBUG] User details fetched successfully for user:', userDetails.email)

                // Return properly formatted user object for NextAuth
                const authResult = {
                    id: userDetails.id?.toString() || userDetails.email,
                    name: userDetails.name || userDetails.username || userDetails.email.split('@')[0],
                    email: userDetails.email,
                    image: userDetails.image || userDetails.avatar || null,
                    access: jwtTokens.access,
                    refresh: jwtTokens.refresh,
                }

                console.log('[DEBUG] Authorization successful, returning user data with id:', authResult.id)
                return authResult
            } catch (error) {
                console.error('[DEBUG] Exception during authorization:')
                console.error('  - Error message:', error instanceof Error ? error.message : 'Unknown error')
                console.error('  - Error name:', error instanceof Error ? error.name : 'Unknown')
                console.error('  - Error stack:', error instanceof Error ? error.stack : 'No stack trace')
                console.error('  - Full error object:', error)
                return null
            }
        },
    }),
]

export const providerMap = providers.map((provider) => {
    if (typeof provider === 'function') {
        const providerData = provider()
        return { id: providerData.id, name: providerData.name }
    } else {
        return { id: provider.id, name: provider.name }
    }
})

export const { auth, handlers, signIn, signOut } = NextAuth({
    providers,
    pages: {
        signIn: '/login',
    },
    cookies: {
        sessionToken: {
            name: 'next-auth.session-token',
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
            },
        },
    },
    callbacks: {
        async jwt({ token, user }: { token: any; user: any }) {
            if (user) {
                token.id = user.id
                token.name = user.name
                token.email = user.email
                token.image = user.image
                token.access = user.access
                token.refresh = user.refresh
            }
            return token
        },
        async session({ session, token }: { session: any; token: any }) {
            if (token) {
                session.user = {
                    id: token.id as string,
                    name: token.name as string,
                    email: token.email as string,
                    image: token.image as string,
                }
                session.access = token.access
                session.refresh = token.refresh
            }
            return session
        },
        async signIn({ user, account, profile, email, credentials }) {
            return true
        },
    },
    events: {
        async signIn(message) {
            console.log('[DEBUG] SignIn event triggered:', message.user?.email)
        },
        async signOut(message) {
            console.log('[DEBUG] SignOut event triggered')
        },
        async createUser(message) {
            console.log('[DEBUG] CreateUser event triggered:', message.user.email)
        },
        async session(message) {
            console.log('[DEBUG] Session event triggered')
        },
    },
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || process.env.SECRET,
    session: {
        strategy: 'jwt',
        maxAge: 24 * 60 * 60, // Token expiration time (1 day)
        updateAge: 24 * 60 * 60, // Only update at session expiry to avoid loops
    },
    debug: false, // Disable debug mode to reduce log spam
})
