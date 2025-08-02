import NextAuth, { DefaultSession, DefaultUser } from 'next-auth'
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
    interface Session extends DefaultSession {
        access: string
        refresh: string
        user: {
            id: string
        } & DefaultSession['user']
    }

    interface User extends DefaultUser {
        id: string
        access: string
        refresh: string
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string
        name: string
        email: string
        image: string
        access: string
        refresh: string
    }
}
