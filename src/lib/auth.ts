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
        async authorize(credentials) {
            const { email, password } = userLoginSchema.parse(credentials)

            if (!credentials?.email || !credentials?.password) {
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
                    return null
                }

                const userDetails = await userDetailsRes.json()

                // Return properly formatted user object for NextAuth
                return {
                    id: userDetails.id?.toString() || userDetails.email,
                    name: userDetails.name || userDetails.username || userDetails.email.split('@')[0],
                    email: userDetails.email,
                    image: userDetails.image || userDetails.avatar || null,
                    access: jwtTokens.access,
                    refresh: jwtTokens.refresh,
                }
            } catch (error) {
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
    session: {
        strategy: 'jwt',
        maxAge: 24 * 60 * 60, // 1 day
    },
    callbacks: {
        async jwt({ token, user }) {
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
        async session({ session, token }) {
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
        async signIn() {
            return true
        },
    },
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
})
