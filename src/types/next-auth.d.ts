/* eslint-disable @typescript-eslint/no-unused-vars */

// import { DefaultSession, DefaultUser, User } from 'next-auth'
// import { JWT } from 'next-auth/jwt'

import NextAuth from 'next-auth'

//We are extending the DefaultSession and DefaultUser interfaces from next-auth to add the access and refresh tokens to the session and user objects.
interface IUser extends DefaultUser {
    access: string
    refresh: string
}

type UserId = string

declare module 'next-auth/jwt' {
    interface JWT extends IUser {}
}

declare module 'next-auth' {
    interface User extends IUser {}
    interface Session {
        // user?: User,
        access?: string
        refresh?: string
    }
}
