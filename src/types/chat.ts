import { UserDetails } from './auth'
import { Workspace } from './workspaces'

export interface ChatSession {
    id: string
    user: UserDetails
    started_at: string
    name?: string
    ai_provider: 'OpenAI' | 'ClaudeAI' | 'GeminiAI'
    ai_model:
        | 'gpt-4o'
        | 'gpt-4-turbo'
        | 'gpt-3.5-turbo-0125'
        | 'claude-3-5-SONNET_20240620'
        | 'claude-3-opus-20240229'
        | 'claude-3-haiku-20240307'
        | 'o1'
        | 'o1-mini'
        | 'o3-mini'
        | 'o1-preview'
    status: 'active' | 'completed' | 'abandoned' | 'archived'
    max_tokens?: number
    stream: boolean
    stream_options?: Record<string, any>
    temperature?: number
    top_p?: number
    stop_sequences?: string[]
    top_k?: number
    frequency_penalty?: number
    logit_bias?: Record<string, number>
    logprobs?: boolean
    top_logprobs?: number
    n?: number
    presence_penalty?: number
    response_format?: string
    seed?: number
    user_identifier?: string
    service_tier?: string
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
    duration?: string
    total_messages: number
    messages?: Message[]
    workspace: Workspace
    shared: boolean
    public: boolean
    shareable_link?: string
}

export interface Message {
    id: string
    user: UserDetails
    session: string
    role: 'user' | 'assistant' | 'system' | 'tool'
    content: string
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
    created_at: string
    responses: Message[]
    parent_message: string
}

export interface MessageResponse {
    user_message: Message
    ai_message: Message
}

export interface ChatSessionCreateForm {
    name: string
    ai_model?: string
    ai_provider?: string
}
