import { UserDetails } from './auth'
import { Subscription } from './subscriptions'

export interface Invitation {
    id: string
    inviter: UserDetails
    invitee?: UserDetails
    role: string
    email: string
    created_at: string
    is_accepted: boolean
    workspace?: string
    team?: string
}

export interface InvitationCreateFormData {
    role: 'member' | 'admin' | undefined
    inviteeEmail: string
}

export interface TeamMember {
    team: string
    user: UserDetails
    role: string
    date_joined: string
    id: string
}

export interface WorkspaceMember {
    workspace: string
    user: UserDetails
    role: string
    date_joined: string
    id: string
}

export interface Team {
    id: string
    name: string
    slug: string
    workspace: string
    owner: UserDetails
    invitations?: Invitation[]
    created_at?: string
    updated_at?: string
    members?: TeamMember[]
}

export interface TeamCreateFormData {
    name: string
    slug: string
}

export interface TeamUpdateFormData {
    name: string
    slug: string
    workspace?: string
}

export interface Workspace {
    created_at: string
    updated_at: string
    name: string
    slug: string
    id: string
    status: string
    subscription_id?: string
    teams?: Team[]
    subscription?: Subscription | null
    members?: WorkspaceMember[]
    owner: UserDetails
}

export interface WorkspaceCreateFormData {
    workspaceName: string
    slug: string
}

export interface WorkspaceEditFormData {
    workspaceName: string
    slug: string
    status: 'active' | 'archived' | string
}
