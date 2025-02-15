/* eslint-disable @typescript-eslint/no-unused-vars */
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

import type { Provider } from 'next-auth/providers'

import { getApiURL } from './utils'
import { userLoginSchema } from './validations/auth'
import { isJWTTokenValid } from './verify-token'
import { refreshToken } from './refresh-token'

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
            if (token.access && (await isJWTTokenValid(token.access))) {
                try {
                    const refreshedToken = await refreshToken(token.refresh) // Implement refreshToken logic
                    token.access = refreshedToken.access
                    token.refresh = refreshedToken.refresh
                } catch (error) {
                    console.error('Error refreshing token:', error)
                    return {}
                }
            }
            if (user) {
                token.access = user.access
                token.refresh = user.refresh
            }
            const isValid = isJWTTokenValid(token.access)
            if (!isValid) {
                // Invalidate the token
                return {}
            }
            return token
        },
        session({ session, token }: { session: any; token: any }) {
            // If the token is invalid, the session should not include access/refresh tokens
            const isValid = isJWTTokenValid(token.access)
            if (!isValid) {
                return {}
            }

            if (token) {
                session.access = token.access
                session.refresh = token.refresh
            }
            return session
        },
    },
    secret: process.env.SECRET,
    session: {
        strategy: 'jwt',
        maxAge: 24 * 60 * 60, // Token expiration time (1 day)
        updateAge: 60 * 60, // Frequency to update the token (1 hour)
    },
    debug: process.env.NODE_ENV === 'development',
})

// export const authOptions: NextAuthOptions = {
//     providers: [
//         CredentialsProvider({
//             name: 'Credentials',
//             credentials: {
//                 email: {
//                     label: 'Email',
//                     type: 'text',
//                     placeholder: 'jsmith@gmail.com',
//                 },
//                 password: { label: 'Password', type: 'password' },
//             },
//             async authorize(credentials, req) {
//                 const { email, password } = userLoginSchema.parse(credentials)

//                 if (credentials) {
//                     if (!credentials.email || !credentials.password) {
//                         throw new Error('Please enter an email and password')
//                     }
//                 }

//                 const BACKEND_URL = getApiURL()
//                 const USER_LOGIN_ENDPOINT = BACKEND_URL.concat('/auth/jwt/create/')
//                 const USER_DETAILS_ENDPOINT = BACKEND_URL.concat('/auth/users/me/')

//                 const jwtRes = await fetch(USER_LOGIN_ENDPOINT, {
//                     method: 'POST',
//                     headers: { 'Content-Type': 'application/json' },
//                     body: JSON.stringify(credentials),
//                 })
//                 const jwtTokens = await jwtRes.json()

//                 if (jwtTokens.detail) {
//                     throw new Error(jwtTokens.detail)
//                 }

//                 const userDetailsRes = await fetch(USER_DETAILS_ENDPOINT, {
//                     method: 'GET',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         Authorization: `JWT ${jwtTokens.access}`,
//                     },
//                 })
//                 const userDetails = await userDetailsRes.json()

//                 const finalUser = {
//                     ...userDetails,
//                     access: jwtTokens.access,
//                     refresh: jwtTokens.refresh,
//                 }

//                 //We are using a custom API route to handle the login request and return the user data.
//                 // The api point auth/jwt/create/ is provided by the django-rest-framework-simplejwt package.
//                 // It takes the email and password and returns the user data along with the access and refresh tokens.
//                 if (jwtTokens.access && jwtTokens.refresh && userDetails) {
//                     return finalUser
//                 } else {
//                     // If you return null then an error will be displayed advising the user to check their details.
//                     // throw new Error("No user found")
//                     return null

//                     // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
//                 }
//             },
//         }),
//     ],
//     callbacks: {
//         jwt({ token, user }: { token: any; user: any }) {
//             if (user) {
//                 token.access = user.access
//                 token.refresh = user.refresh
//             }
//             return token
//         },
//         session({ session, token }: { session: any; token: any }) {
//             if (token) {
//                 session.access = token.access
//                 session.refresh = token.refresh
//             }
//             return session
//         },
//     },
//     secret: process.env.SECRET,
//     session: {
//         strategy: 'jwt',
//     },
//     debug: process.env.NODE_ENV === 'development',
// }
