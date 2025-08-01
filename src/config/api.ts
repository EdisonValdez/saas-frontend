import { getApiURL } from '@/lib/utils'

export interface ApiEndpoints {
    auth: {
        session: string
        login: string
        logout: string
        refresh: string
        verify: string
        register: string
        activate: string
        resetPassword: string
        resetUsername: string
    }
    workspaces: {
        list: string
        detail: (workspaceId: string) => string
        creditUsage: (workspaceId: string) => string
        chats: (workspaceId: string) => string
        clients: (workspaceId: string) => string
        emailAgent: (workspaceId: string) => string
        taxAssistant: (workspaceId: string) => string
        invitations: (workspaceId: string) => string
        memberships: (workspaceId: string) => string
    }
    clients: {
        detail: (clientId: string) => string
        documents: (clientId: string) => string
        onboarding: string
    }
    documents: {
        detail: (documentId: string) => string
        upload: string
        extractedData: (documentId: string) => string
        extraction: (documentId: string) => string
    }
    agents: {
        invoke: string
        email: string
    }
    subscriptions: {
        pricing: string
        checkout: string
        portal: string
    }
}

export const API_ENDPOINTS: ApiEndpoints = {
    auth: {
        session: '/api/auth/session',
        login: '/auth/jwt/create/',
        logout: '/api/auth/logout',
        refresh: '/auth/jwt/refresh/',
        verify: '/auth/jwt/verify/',
        register: '/api/auth/register',
        activate: '/api/auth/activate-user',
        resetPassword: '/api/auth/reset-password',
        resetUsername: '/api/auth/reset-username',
    },
    workspaces: {
        list: '/api/workspaces/',
        detail: (workspaceId: string) => `/api/workspaces/${workspaceId}/`,
        creditUsage: (workspaceId: string) => `/api/workspaces/${workspaceId}/credit-usage/`,
        chats: (workspaceId: string) => `/api/workspaces/${workspaceId}/chats/`,
        clients: (workspaceId: string) => `/api/workspaces/${workspaceId}/clients/`,
        emailAgent: (workspaceId: string) => `/api/workspaces/${workspaceId}/email-agent/`,
        taxAssistant: (workspaceId: string) => `/api/workspaces/${workspaceId}/tax-assistant/`,
        invitations: (workspaceId: string) => `/api/workspaces/${workspaceId}/invitations/`,
        memberships: (workspaceId: string) => `/api/workspaces/${workspaceId}/memberships/`,
    },
    clients: {
        detail: (clientId: string) => `/api/clients/${clientId}/`,
        documents: (clientId: string) => `/api/clients/${clientId}/documents/`,
        onboarding: '/api/onboarding/',
    },
    documents: {
        detail: (documentId: string) => `/api/documents/${documentId}/`,
        upload: '/api/documents/upload/',
        extractedData: (documentId: string) => `/api/documents/${documentId}/extracted-data/`,
        extraction: (documentId: string) => `/api/documents/${documentId}/extraction/`,
    },
    agents: {
        invoke: '/api/agents/invoke/',
        email: '/api/agents/email/',
    },
    subscriptions: {
        pricing: '/api/subscriptions/pricing/',
        checkout: '/api/subscriptions/checkout/',
        portal: '/api/subscriptions/create-portal-link/',
    },
}

// Django backend endpoints mapping (with proper trailing slashes)
export const DJANGO_ENDPOINTS = {
    auth: {
        login: '/auth/jwt/create/',
        refresh: '/auth/jwt/refresh/',
        verify: '/auth/jwt/verify/',
        userDetails: '/auth/users/me/',
        register: '/auth/users/',
        activate: '/auth/users/activation/',
        resetPassword: '/auth/users/reset_password/',
        resetUsername: '/auth/users/reset_email/',
    },
    workspaces: {
        list: '/api/workspaces/',
        detail: (workspaceId: string) => `/api/workspaces/${workspaceId}/`,
        creditUsage: (workspaceId: string) => `/api/workspaces/${workspaceId}/credit-usage/`, // Django expects trailing slash
        chats: (workspaceId: string) => `/api/workspaces/${workspaceId}/chats/`,
        clients: (workspaceId: string) => `/api/workspaces/${workspaceId}/clients/`,
        emailAgent: (workspaceId: string) => `/api/workspaces/${workspaceId}/email-agent/`,
        taxAssistant: (workspaceId: string) => `/api/workspaces/${workspaceId}/tax-assistant/`,
    },
    clients: {
        detail: (clientId: string) => `/api/clients/${clientId}/`,
        documents: (clientId: string) => `/api/clients/${clientId}/documents/`,
    },
    documents: {
        detail: (documentId: string) => `/api/documents/${documentId}/`,
        upload: '/api/documents/upload/',
        extractedData: (documentId: string) => `/api/documents/${documentId}/extracted-data/`,
    },
    agents: {
        invoke: '/api/agents/invoke/',
        email: '/api/agents/email/',
    },
}

export function getDjangoUrl(endpoint: string): string {
    const baseUrl = getApiURL()
    return `${baseUrl}${endpoint}`
}

export function getNextApiUrl(endpoint: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ''
    return `${baseUrl}${endpoint}`
}

// Configuration for different environments
export const API_CONFIG = {
    timeout: 30000, // 30 seconds
    retries: 3,
    retryDelay: 1000, // 1 second
    headers: {
        'Content-Type': 'application/json',
    },
    // CORS settings
    cors: {
        credentials: 'include' as RequestCredentials,
        mode: 'cors' as RequestMode,
    },
}

// Error codes mapping
export const API_ERROR_CODES = {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
} as const

export type ApiErrorCode = (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES]

// Helper function to check if an endpoint requires authentication
export function requiresAuth(endpoint: string): boolean {
    const publicEndpoints = [API_ENDPOINTS.auth.login, API_ENDPOINTS.auth.register, API_ENDPOINTS.subscriptions.pricing]
    return !publicEndpoints.includes(endpoint)
}

// Helper function to map frontend URLs to Django URLs
export function mapToBackendEndpoint(frontendEndpoint: string): string {
    // Direct mapping for specific cases
    const endpointMap: Record<string, string> = {
        '/api/auth/session': DJANGO_ENDPOINTS.auth.userDetails,
        '/api/agents/invoke/': DJANGO_ENDPOINTS.agents.invoke,
        '/api/agents/email/': DJANGO_ENDPOINTS.agents.email,
    }

    // Check for workspace-specific endpoints
    const workspacePattern = /^\/api\/workspaces\/([^\/]+)\/([^\/]+)\/?$/
    const workspaceMatch = frontendEndpoint.match(workspacePattern)

    if (workspaceMatch) {
        const [, workspaceId, resource] = workspaceMatch
        switch (resource) {
            case 'credit-usage':
                return DJANGO_ENDPOINTS.workspaces.creditUsage(workspaceId)
            case 'chats':
                return DJANGO_ENDPOINTS.workspaces.chats(workspaceId)
            case 'clients':
                return DJANGO_ENDPOINTS.workspaces.clients(workspaceId)
            case 'email-agent':
                return DJANGO_ENDPOINTS.workspaces.emailAgent(workspaceId)
            case 'tax-assistant':
                return DJANGO_ENDPOINTS.workspaces.taxAssistant(workspaceId)
            default:
                return DJANGO_ENDPOINTS.workspaces.detail(workspaceId)
        }
    }

    // Check for client-specific endpoints
    const clientPattern = /^\/api\/clients\/([^\/]+)\/([^\/]+)\/?$/
    const clientMatch = frontendEndpoint.match(clientPattern)

    if (clientMatch) {
        const [, clientId, resource] = clientMatch
        switch (resource) {
            case 'documents':
                return DJANGO_ENDPOINTS.clients.documents(clientId)
            default:
                return DJANGO_ENDPOINTS.clients.detail(clientId)
        }
    }

    // Return mapped endpoint or original if no mapping found
    return endpointMap[frontendEndpoint] || frontendEndpoint
}
