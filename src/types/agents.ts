import { UserDetails } from './auth'
import { Workspace } from './workspaces'

export interface TaxAssistantSession {
    id: string
    user: UserDetails
    workspace: Workspace
    name: string
    status: 'active' | 'completed' | 'archived'
    client_id?: string
    client_name?: string
    created_at: string
    updated_at: string
    messages?: TaxAssistantMessage[]
    total_messages: number
}

export interface TaxAssistantMessage {
    id: string
    user: UserDetails
    session: string
    role: 'user' | 'assistant' | 'system'
    content: string
    created_at: string
    client_context?: string
    document_references?: string[]
}

export interface EmailAgentSession {
    id: string
    user: UserDetails
    workspace: Workspace
    name: string
    status: 'active' | 'completed' | 'archived'
    client_id?: string
    client_name?: string
    email_subject?: string
    email_type: 'draft' | 'response' | 'follow_up' | 'notification'
    created_at: string
    updated_at: string
    messages?: EmailAgentMessage[]
    total_messages: number
}

export interface EmailAgentMessage {
    id: string
    user: UserDetails
    session: string
    role: 'user' | 'assistant' | 'system'
    content: string
    created_at: string
    client_context?: string
    email_metadata?: {
        subject?: string
        recipients?: string[]
        cc?: string[]
        bcc?: string[]
    }
}

export interface AgentInvokePayload {
    prompt: string
    workspaceId: string
    clientId?: string
    sessionId?: string
    agentType: 'tax_assistant' | 'email_agent'
}

export interface AgentSessionCreateForm {
    name: string
    client_id?: string
    client_name?: string
    email_subject?: string
    email_type?: 'draft' | 'response' | 'follow_up' | 'notification'
}
