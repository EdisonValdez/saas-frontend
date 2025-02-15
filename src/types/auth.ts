import { Workspace } from './workspaces'

export interface LoginFormData {
    email?: string
    username?: string
    password: string
}

export interface EmailInputFormData {
    email: string
}

export interface AccountDeleteFormData {
    password: string
}

export interface ConfirmPasswordResetFormData {
    uid: string | undefined
    token: string | undefined
    new_password: string
    re_new_password: string
}

export interface ConfirmUsernameResetFormData {
    uid: string | undefined
    token: string | undefined
    // new_username?: string | undefined;
    new_email: string
    re_new_email?: string
}

//Check this again for the null
export interface UserDetails {
    id?: number /* primary key */
    username?: string
    email?: string | null
    name?: string | null
    subscription_status?: string
    has_active_subscription?: boolean
    workspaces?: Workspace[] | null
    image?: string | null
}

export interface TokenResponse {
    access: string
}
