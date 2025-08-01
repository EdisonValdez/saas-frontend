import { authService, type AuthSession } from './auth-bridge'
import {
    API_ENDPOINTS,
    DJANGO_ENDPOINTS,
    getDjangoUrl,
    API_CONFIG,
    API_ERROR_CODES,
    mapToBackendEndpoint,
} from '@/config/api'

export interface ApiResponse<T = any> {
    data?: T
    error?: string
    status: number
    success: boolean
    message?: string
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

export interface ChatMessage {
    id: string
    content: string
    role: 'user' | 'assistant'
    timestamp: string
    workspace_id: string
    metadata?: any
}

export interface CreditUsage {
    used: number
    limit: number
    remaining: number
    period_start: string
    period_end: string
}

class EnhancedApiClient {
    private retryCount = 0
    private maxRetries = API_CONFIG.retries

    private async request<T>(endpoint: string, options: RequestInit = {}, useProxy = false): Promise<ApiResponse<T>> {
        try {
            // Get authentication headers
            const authHeaders = await authService.getAuthHeaders()

            // Determine the URL - either proxy through Next.js API or direct to Django
            const url = useProxy ? endpoint : getDjangoUrl(mapToBackendEndpoint(endpoint))

            const response = await fetch(url, {
                ...API_CONFIG.cors,
                ...options,
                headers: {
                    ...API_CONFIG.headers,
                    ...authHeaders,
                    ...options.headers,
                },
                signal: AbortSignal.timeout(API_CONFIG.timeout),
            })

            let data: any = {}
            try {
                data = await response.json()
            } catch (e) {
                // Response might not be JSON
                data = {}
            }

            // Handle 401 - try to refresh token
            if (response.status === API_ERROR_CODES.UNAUTHORIZED && this.retryCount < 1) {
                this.retryCount++
                const refreshResult = await authService.refreshSession()

                if (refreshResult.success) {
                    // Retry the request with refreshed token
                    return this.request<T>(endpoint, options, useProxy)
                } else {
                    // Refresh failed, clear auth and redirect
                    await authService.signOut()
                    window.location.href = '/login'
                    return {
                        error: 'Authentication failed',
                        status: API_ERROR_CODES.UNAUTHORIZED,
                        success: false,
                    }
                }
            }

            this.retryCount = 0 // Reset retry count on successful response

            return {
                data: response.ok ? data : undefined,
                error: !response.ok
                    ? data.error || data.detail || data.message || `HTTP ${response.status}`
                    : undefined,
                status: response.status,
                success: response.ok,
                message: data.message,
            }
        } catch (error) {
            // Handle network errors with retry
            if (this.retryCount < this.maxRetries) {
                this.retryCount++
                await new Promise((resolve) => setTimeout(resolve, API_CONFIG.retryDelay))
                return this.request<T>(endpoint, options, useProxy)
            }

            this.retryCount = 0
            return {
                error: error instanceof Error ? error.message : 'Network error',
                status: 0,
                success: false,
            }
        }
    }

    // Authentication methods
    async getSession(): Promise<ApiResponse<AuthSession>> {
        try {
            const session = await authService.getSession()
            return {
                data: session || undefined,
                status: session ? 200 : 401,
                success: !!session,
            }
        } catch (error) {
            return {
                error: error instanceof Error ? error.message : 'Failed to get session',
                status: 500,
                success: false,
            }
        }
    }

    // Workspace methods
    async getWorkspaces(): Promise<ApiResponse<{ workspaces: any[] }>> {
        return this.request(API_ENDPOINTS.workspaces.list)
    }

    async getWorkspace(workspaceId: string): Promise<ApiResponse<any>> {
        return this.request(API_ENDPOINTS.workspaces.detail(workspaceId))
    }

    async getCreditUsage(workspaceId: string): Promise<ApiResponse<CreditUsage>> {
        // Use the Next.js proxy route which handles the Django backend correctly
        return this.request<CreditUsage>(
            API_ENDPOINTS.workspaces.creditUsage(workspaceId),
            {},
            true // Use proxy
        )
    }

    // Client management methods
    async getWorkspaceClients(workspaceId: string): Promise<ApiResponse<{ clients: ClientData[]; total: number }>> {
        return this.request(API_ENDPOINTS.workspaces.clients(workspaceId))
    }

    async createClient(workspaceId: string, clientData: Partial<ClientData>): Promise<ApiResponse<ClientData>> {
        return this.request(API_ENDPOINTS.workspaces.clients(workspaceId), {
            method: 'POST',
            body: JSON.stringify(clientData),
        })
    }

    async getClient(workspaceId: string, clientId: string): Promise<ApiResponse<ClientData>> {
        return this.request(API_ENDPOINTS.clients.detail(clientId))
    }

    async updateClient(
        workspaceId: string,
        clientId: string,
        updates: Partial<ClientData>
    ): Promise<ApiResponse<ClientData>> {
        return this.request(API_ENDPOINTS.clients.detail(clientId), {
            method: 'PATCH',
            body: JSON.stringify(updates),
        })
    }

    async deleteClient(workspaceId: string, clientId: string): Promise<ApiResponse<void>> {
        return this.request(API_ENDPOINTS.clients.detail(clientId), {
            method: 'DELETE',
        })
    }

    // Document management methods
    async getClientDocuments(clientId: string): Promise<ApiResponse<{ documents: DocumentData[] }>> {
        return this.request(API_ENDPOINTS.clients.documents(clientId))
    }

    async uploadDocument(clientId: string, file: File, metadata?: any): Promise<ApiResponse<DocumentData>> {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('client_id', clientId)
        if (metadata) {
            formData.append('metadata', JSON.stringify(metadata))
        }

        const authHeaders = await authService.getAuthHeaders()
        delete authHeaders['Content-Type'] // Let browser set Content-Type for FormData

        return this.request(API_ENDPOINTS.documents.upload, {
            method: 'POST',
            headers: authHeaders,
            body: formData,
        })
    }

    async getDocument(documentId: string): Promise<ApiResponse<DocumentData>> {
        return this.request(API_ENDPOINTS.documents.detail(documentId))
    }

    async getExtractedData(documentId: string): Promise<ApiResponse<any>> {
        return this.request(API_ENDPOINTS.documents.extractedData(documentId))
    }

    // Agent methods
    async invokeAgent(
        prompt: string,
        workspaceId: string,
        context?: any
    ): Promise<ApiResponse<{ response: string; credits_used: number }>> {
        return this.request(API_ENDPOINTS.agents.invoke, {
            method: 'POST',
            body: JSON.stringify({
                prompt,
                workspace_id: workspaceId,
                context,
            }),
        })
    }

    // Chat methods
    async getWorkspaceChats(workspaceId: string): Promise<ApiResponse<{ chats: any[] }>> {
        return this.request(API_ENDPOINTS.workspaces.chats(workspaceId))
    }

    async sendChatMessage(workspaceId: string, chatId: string, message: string): Promise<ApiResponse<ChatMessage>> {
        return this.request(`${API_ENDPOINTS.workspaces.chats(workspaceId)}${chatId}/messages/`, {
            method: 'POST',
            body: JSON.stringify({ content: message }),
        })
    }

    // Email Agent methods
    async getEmailAgentSessions(workspaceId: string): Promise<ApiResponse<any[]>> {
        return this.request(API_ENDPOINTS.workspaces.emailAgent(workspaceId))
    }

    async createEmailAgentSession(workspaceId: string, data: any): Promise<ApiResponse<any>> {
        return this.request(API_ENDPOINTS.workspaces.emailAgent(workspaceId), {
            method: 'POST',
            body: JSON.stringify(data),
        })
    }

    // Tax Assistant methods
    async getTaxAssistantSessions(workspaceId: string): Promise<ApiResponse<any[]>> {
        return this.request(API_ENDPOINTS.workspaces.taxAssistant(workspaceId))
    }

    async createTaxAssistantSession(workspaceId: string, data: any): Promise<ApiResponse<any>> {
        return this.request(API_ENDPOINTS.workspaces.taxAssistant(workspaceId), {
            method: 'POST',
            body: JSON.stringify(data),
        })
    }

    // Subscription methods
    async getWorkspaceSubscription(workspaceId: string): Promise<ApiResponse<any>> {
        return this.request(`${API_ENDPOINTS.workspaces.detail(workspaceId)}subscription/`)
    }

    async getPricingPlans(): Promise<ApiResponse<any[]>> {
        return this.request(API_ENDPOINTS.subscriptions.pricing)
    }

    async createCheckoutSession(data: any): Promise<ApiResponse<{ url: string }>> {
        return this.request(API_ENDPOINTS.subscriptions.checkout, {
            method: 'POST',
            body: JSON.stringify(data),
        })
    }

    async createPortalSession(): Promise<ApiResponse<{ url: string }>> {
        return this.request(API_ENDPOINTS.subscriptions.portal, {
            method: 'POST',
        })
    }

    // Utility methods
    async healthCheck(): Promise<ApiResponse<{ status: string }>> {
        return this.request('/api/health/')
    }

    // Method to clear cache and retry failed requests
    async retryWithFreshAuth<T>(originalRequest: () => Promise<ApiResponse<T>>): Promise<ApiResponse<T>> {
        authService.clearCache()
        return originalRequest()
    }
}

export const enhancedApiClient = new EnhancedApiClient()

// React Query keys for consistent cache management
export const queryKeys = {
    auth: ['auth'],
    session: ['auth', 'session'],
    workspaces: ['workspaces'],
    workspace: (workspaceId: string) => ['workspaces', workspaceId],
    clients: (workspaceId: string) => ['workspaces', workspaceId, 'clients'],
    client: (clientId: string) => ['clients', clientId],
    documents: (clientId: string) => ['clients', clientId, 'documents'],
    document: (documentId: string) => ['documents', documentId],
    extractedData: (documentId: string) => ['documents', documentId, 'extracted-data'],
    creditUsage: (workspaceId: string) => ['workspaces', workspaceId, 'credit-usage'],
    subscription: (workspaceId: string) => ['workspaces', workspaceId, 'subscription'],
    chats: (workspaceId: string) => ['workspaces', workspaceId, 'chats'],
    emailSessions: (workspaceId: string) => ['workspaces', workspaceId, 'email-sessions'],
    taxSessions: (workspaceId: string) => ['workspaces', workspaceId, 'tax-sessions'],
    pricing: ['pricing'],
}

// Common error handler
export const handleApiError = (error: string | undefined, fallback = 'An error occurred') => {
    return error || fallback
}

// Credit check utility
export const canPerformAction = (creditUsage: CreditUsage, requiredCredits: number = 1) => {
    return creditUsage.remaining >= requiredCredits
}

// Type guards
export function isApiError(response: ApiResponse<any>): response is ApiResponse<never> & { error: string } {
    return !response.success && !!response.error
}

export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiResponse<T> & { data: T } {
    return response.success && response.data !== undefined
}
