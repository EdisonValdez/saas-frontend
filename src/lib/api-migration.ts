/**
 * API Client Migration Utility
 * 
 * This file helps migrate from the old api-client.ts to the new enhanced API client
 * with better error handling, authentication, and Django integration.
 */

import { apiClient as oldApiClient } from './api-client'
import { enhancedApiClient } from './api-client-enhanced'
import { authService } from './auth-bridge'

// Migration wrapper that provides backward compatibility
export class ApiClientMigrationWrapper {
    // For components still using the old API client structure
    async getAuthHeaders(): Promise<Record<string, string>> {
        return authService.getAuthHeaders()
    }

    // Workspace methods with enhanced error handling
    async getWorkspaceClients(workspaceId: string) {
        const response = await enhancedApiClient.getWorkspaceClients(workspaceId)
        
        if (!response.success) {
            throw new Error(response.error || 'Failed to fetch clients')
        }
        
        return response.data
    }

    async createClient(workspaceId: string, clientData: any) {
        const response = await enhancedApiClient.createClient(workspaceId, clientData)
        
        if (!response.success) {
            throw new Error(response.error || 'Failed to create client')
        }
        
        return response.data
    }

    async getCreditUsage(workspaceId: string) {
        const response = await enhancedApiClient.getCreditUsage(workspaceId)
        
        if (!response.success) {
            throw new Error(response.error || 'Failed to fetch credit usage')
        }
        
        return response.data
    }

    async invokeAgent(prompt: string, workspaceId: string, context?: any) {
        const response = await enhancedApiClient.invokeAgent(prompt, workspaceId, context)
        
        if (!response.success) {
            throw new Error(response.error || 'Failed to invoke agent')
        }
        
        return response.data
    }

    // Document methods
    async getClientDocuments(clientId: string) {
        const response = await enhancedApiClient.getClientDocuments(clientId)
        
        if (!response.success) {
            throw new Error(response.error || 'Failed to fetch documents')
        }
        
        return response.data
    }

    async uploadDocument(clientId: string, file: File, metadata?: any) {
        const response = await enhancedApiClient.uploadDocument(clientId, file, metadata)
        
        if (!response.success) {
            throw new Error(response.error || 'Failed to upload document')
        }
        
        return response.data
    }

    // Chat methods
    async getWorkspaceChats(workspaceId: string) {
        const response = await enhancedApiClient.getWorkspaceChats(workspaceId)
        
        if (!response.success) {
            throw new Error(response.error || 'Failed to fetch chats')
        }
        
        return response.data
    }

    async sendChatMessage(workspaceId: string, chatId: string, message: string) {
        const response = await enhancedApiClient.sendChatMessage(workspaceId, chatId, message)
        
        if (!response.success) {
            throw new Error(response.error || 'Failed to send message')
        }
        
        return response.data
    }

    // Email Agent methods
    async getEmailAgentSessions(workspaceId: string) {
        const response = await enhancedApiClient.getEmailAgentSessions(workspaceId)
        
        if (!response.success) {
            throw new Error(response.error || 'Failed to fetch email sessions')
        }
        
        return response.data
    }

    async createEmailAgentSession(workspaceId: string, data: any) {
        const response = await enhancedApiClient.createEmailAgentSession(workspaceId, data)
        
        if (!response.success) {
            throw new Error(response.error || 'Failed to create email session')
        }
        
        return response.data
    }

    // Tax Assistant methods
    async getTaxAssistantSessions(workspaceId: string) {
        const response = await enhancedApiClient.getTaxAssistantSessions(workspaceId)
        
        if (!response.success) {
            throw new Error(response.error || 'Failed to fetch tax sessions')
        }
        
        return response.data
    }

    async createTaxAssistantSession(workspaceId: string, data: any) {
        const response = await enhancedApiClient.createTaxAssistantSession(workspaceId, data)
        
        if (!response.success) {
            throw new Error(response.error || 'Failed to create tax session')
        }
        
        return response.data
    }
}

// Export migration wrapper for backward compatibility
export const migratedApiClient = new ApiClientMigrationWrapper()

/**
 * Migration Guide:
 * 
 * 1. For new components, use enhancedApiClient directly with proper error handling:
 *    ```typescript
 *    const response = await enhancedApiClient.getCreditUsage(workspaceId)
 *    if (response.success) {
 *        // Use response.data
 *    } else {
 *        // Handle response.error
 *    }
 *    ```
 * 
 * 2. For existing components, you can use migratedApiClient for a drop-in replacement:
 *    ```typescript
 *    // Old way:
 *    const data = await apiClient.getCreditUsage(workspaceId)
 *    
 *    // Migrated way (maintains same interface):
 *    const data = await migratedApiClient.getCreditUsage(workspaceId)
 *    ```
 * 
 * 3. For React components, use the custom hooks:
 *    ```typescript
 *    import { useCreditUsage } from '@/hooks/use-enhanced-api'
 *    
 *    function MyComponent({ workspaceId }: { workspaceId: string }) {
 *        const { data: creditUsage, isLoading, error } = useCreditUsage(workspaceId)
 *        
 *        if (isLoading) return <div>Loading...</div>
 *        if (error) return <div>Error: {error.message}</div>
 *        
 *        return <div>Credits: {creditUsage?.remaining}</div>
 *    }
 *    ```
 * 
 * 4. Key improvements in the enhanced client:
 *    - Automatic token refresh on 401 errors
 *    - Retry logic for network failures  
 *    - Proper error handling with structured responses
 *    - Support for both proxy (Next.js API routes) and direct Django calls
 *    - Type-safe responses with ApiResponse<T> interface
 *    - Integrated authentication through authService
 */

// Utility function to check if migration is needed
export function checkMigrationNeeded(component: string): void {
    if (process.env.NODE_ENV === 'development') {
        console.warn(`[API Migration] Component "${component}" should migrate to enhanced API client`)
    }
}

// Helper to gradually migrate components
export function createMigrationAdapter<T extends (...args: any[]) => any>(
    oldMethod: T,
    newMethod: T,
    componentName: string
): T {
    return ((...args: Parameters<T>) => {
        checkMigrationNeeded(componentName)
        try {
            return newMethod(...args)
        } catch (error) {
            console.warn(`[API Migration] Enhanced client failed for ${componentName}, falling back to old client`)
            return oldMethod(...args)
        }
    }) as T
}
