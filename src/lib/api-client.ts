import { getSession } from 'next-auth/react'

export interface ApiResponse<T = any> {
    data?: T
    error?: string
    status: number
    success: boolean
}

export interface ClientData {
    id: string
    name: string
    status: 'active' | 'archived'
    entity_type: 'individual' | 'corporation' | 'partnership' | 'llc' | 'nonprofit' | 'trust'
    document_count: number
    workspace: string
    metadata: {
        email?: string
        phone?: string
        address?: string
        tax_id?: string
        notes?: string
        created_date: string
        last_updated: string
        last_activity?: string
    }
}

export interface DocumentData {
    id: string
    name: string
    type: string
    size: number
    client_id: string
    status: 'uploaded' | 'processing' | 'completed' | 'error'
    extracted_data?: any
    upload_date: string
    last_modified: string
    ocr_confidence?: number
}

export interface SubscriptionLimits {
    maxClients: number
    currentClients: number
    aiCredits: number
    usedCredits: number
    features: string[]
    planName: string
    planType: 'starter' | 'professional' | 'enterprise'
}

export interface ChatMessage {
    id: string
    content: string
    role: 'user' | 'assistant'
    timestamp: string
    workspace_id: string
    metadata?: any
}

class ApiClient {
    private baseUrl: string

    constructor() {
        this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api'
    }

    private async getAuthHeaders(): Promise<Record<string, string>> {
        const session = await getSession()
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        }

        if (session?.accessToken) {
            headers.Authorization = `Bearer ${session.accessToken}`
        }

        return headers
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
        try {
            const headers = await this.getAuthHeaders()

            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                ...options,
                headers: {
                    ...headers,
                    ...options.headers,
                },
            })

            const data = await response.json().catch(() => ({}))

            return {
                data: response.ok ? data : undefined,
                error: !response.ok ? data.error || `HTTP ${response.status}` : undefined,
                status: response.status,
                success: response.ok,
            }
        } catch (error) {
            return {
                error: error instanceof Error ? error.message : 'Network error',
                status: 0,
                success: false,
            }
        }
    }

    // Client Management APIs
    async getWorkspaceClients(workspaceId: string): Promise<ApiResponse<{ clients: ClientData[]; total: number }>> {
        return this.request(`/workspaces/${workspaceId}/clients/`)
    }

    async createClient(workspaceId: string, clientData: Partial<ClientData>): Promise<ApiResponse<ClientData>> {
        return this.request(`/workspaces/${workspaceId}/clients/`, {
            method: 'POST',
            body: JSON.stringify(clientData),
        })
    }

    async getClient(workspaceId: string, clientId: string): Promise<ApiResponse<ClientData>> {
        return this.request(`/workspaces/${workspaceId}/clients/${clientId}/`)
    }

    async updateClient(
        workspaceId: string,
        clientId: string,
        updates: Partial<ClientData>
    ): Promise<ApiResponse<ClientData>> {
        return this.request(`/workspaces/${workspaceId}/clients/${clientId}/`, {
            method: 'PATCH',
            body: JSON.stringify(updates),
        })
    }

    async deleteClient(workspaceId: string, clientId: string): Promise<ApiResponse<void>> {
        return this.request(`/workspaces/${workspaceId}/clients/${clientId}/`, {
            method: 'DELETE',
        })
    }

    // Document Management APIs
    async getClientDocuments(clientId: string): Promise<ApiResponse<{ documents: DocumentData[] }>> {
        return this.request(`/clients/${clientId}/documents/`)
    }

    async uploadDocument(clientId: string, file: File, metadata?: any): Promise<ApiResponse<DocumentData>> {
        const formData = new FormData()
        formData.append('file', file)
        if (metadata) {
            formData.append('metadata', JSON.stringify(metadata))
        }

        const headers = await this.getAuthHeaders()
        delete headers['Content-Type'] // Let browser set Content-Type for FormData

        return this.request(`/clients/${clientId}/documents/`, {
            method: 'POST',
            headers,
            body: formData,
        })
    }

    async getDocument(clientId: string, documentId: string): Promise<ApiResponse<DocumentData>> {
        return this.request(`/clients/${clientId}/documents/${documentId}/`)
    }

    async getExtractedData(clientId: string, documentId: string): Promise<ApiResponse<any>> {
        return this.request(`/clients/${clientId}/documents/${documentId}/extracted_data/`)
    }

    // Tax Assistant & Agent APIs
    async invokeAgent(
        prompt: string,
        workspaceId: string,
        context?: any
    ): Promise<ApiResponse<{ response: string; credits_used: number }>> {
        return this.request('/agents/invoke/', {
            method: 'POST',
            body: JSON.stringify({
                prompt,
                workspace_id: workspaceId,
                context,
            }),
        })
    }

    async getCreditUsage(workspaceId: string): Promise<ApiResponse<{ used: number; limit: number }>> {
        return this.request(`/workspaces/${workspaceId}/credit-usage/`)
    }

    // Chat APIs
    async getWorkspaceChats(workspaceId: string): Promise<ApiResponse<{ chats: any[] }>> {
        return this.request(`/workspaces/${workspaceId}/chats/`)
    }

    async sendChatMessage(workspaceId: string, chatId: string, message: string): Promise<ApiResponse<ChatMessage>> {
        return this.request(`/workspaces/${workspaceId}/chats/${chatId}/messages/`, {
            method: 'POST',
            body: JSON.stringify({ content: message }),
        })
    }

    // Email Agent APIs
    async getEmailAgentSessions(workspaceId: string): Promise<ApiResponse<any[]>> {
        return this.request(`/workspaces/${workspaceId}/email-agent/`)
    }

    async createEmailAgentSession(workspaceId: string, data: any): Promise<ApiResponse<any>> {
        return this.request(`/workspaces/${workspaceId}/email-agent/`, {
            method: 'POST',
            body: JSON.stringify(data),
        })
    }

    // Tax Assistant APIs
    async getTaxAssistantSessions(workspaceId: string): Promise<ApiResponse<any[]>> {
        return this.request(`/workspaces/${workspaceId}/tax-assistant/`)
    }

    async createTaxAssistantSession(workspaceId: string, data: any): Promise<ApiResponse<any>> {
        return this.request(`/workspaces/${workspaceId}/tax-assistant/`, {
            method: 'POST',
            body: JSON.stringify(data),
        })
    }

    // Client Onboarding APIs
    async startOnboarding(clientData: any): Promise<ApiResponse<{ session_id: string }>> {
        return this.request('/clients/onboarding/start/', {
            method: 'POST',
            body: JSON.stringify(clientData),
        })
    }

    async getOnboardingStatus(sessionId: string): Promise<ApiResponse<{ status: string; progress: number }>> {
        return this.request(`/clients/onboarding/status/${sessionId}/`)
    }

    async confirmColumnMapping(sessionId: string, mapping: any): Promise<ApiResponse<any>> {
        return this.request(`/clients/onboarding/confirm-mapping/${sessionId}/`, {
            method: 'POST',
            body: JSON.stringify({ mapping }),
        })
    }

    // Subscription and Workspace APIs
    async getWorkspaceSubscription(workspaceId: string): Promise<ApiResponse<SubscriptionLimits>> {
        return this.request(`/workspaces/${workspaceId}/subscription/`)
    }
}

export const apiClient = new ApiClient()

// React Query keys for consistent cache management
export const queryKeys = {
    clients: (workspaceId: string) => ['clients', workspaceId],
    client: (workspaceId: string, clientId: string) => ['client', workspaceId, clientId],
    documents: (clientId: string) => ['documents', clientId],
    document: (clientId: string, documentId: string) => ['document', clientId, documentId],
    extractedData: (clientId: string, documentId: string) => ['extractedData', clientId, documentId],
    creditUsage: (workspaceId: string) => ['creditUsage', workspaceId],
    subscription: (workspaceId: string) => ['subscription', workspaceId],
    chats: (workspaceId: string) => ['chats', workspaceId],
    emailSessions: (workspaceId: string) => ['emailSessions', workspaceId],
    taxSessions: (workspaceId: string) => ['taxSessions', workspaceId],
}

// Common error handler
export const handleApiError = (error: string | undefined, fallback = 'An error occurred') => {
    return error || fallback
}

// Credit check utility
export const canPerformAction = (creditUsage: { used: number; limit: number }, requiredCredits: number = 1) => {
    return creditUsage.used + requiredCredits <= creditUsage.limit
}
