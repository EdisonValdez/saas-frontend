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
            const { email, password } = userLoginSchema.parse(credentials)

            if (!credentials?.email || !credentials?.password) {
                console.error('Email and password are required')
                return null
            }

            const BACKEND_URL = getApiURL()
            const USER_LOGIN_ENDPOINT = BACKEND_URL.concat('/auth/jwt/create/')
            const USER_DETAILS_ENDPOINT = BACKEND_URL.concat('/auth/users/me/')

            try {
                // Fetch JWT tokens
                const jwtRes = await fetch(USER_LOGIN_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                })

                if (!jwtRes.ok) {
                    console.error('Failed to fetch tokens:', jwtRes.statusText)
                    return null
                }

                const jwtTokens = await jwtRes.json()

                // Fetch user details
                const userDetailsRes = await fetch(USER_DETAILS_ENDPOINT, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `JWT ${jwtTokens.access}`,
                    },
                })

                if (!userDetailsRes.ok) {
                    console.error('Failed to fetch user details:', userDetailsRes.statusText)
                    return null
                }

                const userDetails = await userDetailsRes.json()

                return {
                    ...userDetails,
                    access: jwtTokens.access,
                    refresh: jwtTokens.refresh,
                }
            } catch (error) {
                console.error('Error during login:', error)
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
    callbacks: {
        async jwt({ token, user }: { token: any; user: any }) {
            if (user) {
                token.access = user.access
                token.refresh = user.refresh
            }
            return token
        },
        session({ session, token }: { session: any; token: any }) {
            if (token) {
                session.access = token.access
                session.refresh = token.refresh
            }
            return session
        },
    },
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || process.env.SECRET,
    session: {
        strategy: 'jwt',
        maxAge: 24 * 60 * 60, // Token expiration time (1 day)
        updateAge: 60 * 60, // Frequency to update the token (1 hour)
    },
    debug: process.env.NODE_ENV === 'development',
})
