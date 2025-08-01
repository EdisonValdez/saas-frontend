'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { enhancedApiClient, queryKeys, type ApiResponse, type CreditUsage, type ClientData } from '@/lib/api-client-enhanced'
import { authService } from '@/lib/auth-bridge'
import { useEffect, useState } from 'react'

// Hook for managing authentication state
export function useEnhancedAuth() {
    const { data: nextAuthSession, status } = useSession()
    const [authSession, setAuthSession] = useState<any>(null)
    const router = useRouter()

    useEffect(() => {
        async function getSession() {
            const session = await authService.getSession()
            setAuthSession(session)
        }
        
        if (status === 'authenticated') {
            getSession()
        }
    }, [status, nextAuthSession])

    const signOut = async () => {
        await authService.signOut()
        router.push('/login')
    }

    const refreshSession = async () => {
        const result = await authService.refreshSession()
        if (result.success) {
            setAuthSession(result.data)
        }
        return result
    }

    return {
        session: authSession,
        isAuthenticated: !!authSession?.access,
        isLoading: status === 'loading',
        signOut,
        refreshSession,
    }
}

// Hook for credit usage
export function useCreditUsage(workspaceId: string) {
    return useQuery({
        queryKey: queryKeys.creditUsage(workspaceId),
        queryFn: () => enhancedApiClient.getCreditUsage(workspaceId),
        enabled: !!workspaceId,
        refetchInterval: 30000, // Refetch every 30 seconds
        select: (response) => response.success ? response.data : undefined,
    })
}

// Hook for workspace clients
export function useWorkspaceClients(workspaceId: string) {
    return useQuery({
        queryKey: queryKeys.clients(workspaceId),
        queryFn: () => enhancedApiClient.getWorkspaceClients(workspaceId),
        enabled: !!workspaceId,
        select: (response) => response.success ? response.data : undefined,
    })
}

// Hook for creating a client
export function useCreateClient(workspaceId: string) {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: (clientData: Partial<ClientData>) => 
            enhancedApiClient.createClient(workspaceId, clientData),
        onSuccess: () => {
            // Invalidate and refetch clients list
            queryClient.invalidateQueries({ queryKey: queryKeys.clients(workspaceId) })
        },
    })
}

// Hook for invoking agents
export function useInvokeAgent() {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: ({ prompt, workspaceId, context }: { 
            prompt: string
            workspaceId: string
            context?: any 
        }) => enhancedApiClient.invokeAgent(prompt, workspaceId, context),
        onSuccess: (data, variables) => {
            // Invalidate credit usage after successful agent invocation
            queryClient.invalidateQueries({ 
                queryKey: queryKeys.creditUsage(variables.workspaceId) 
            })
        },
    })
}

// Hook for workspace data
export function useWorkspace(workspaceId: string) {
    return useQuery({
        queryKey: queryKeys.workspace(workspaceId),
        queryFn: () => enhancedApiClient.getWorkspace(workspaceId),
        enabled: !!workspaceId,
        select: (response) => response.success ? response.data : undefined,
    })
}

// Hook for email agent sessions
export function useEmailAgentSessions(workspaceId: string) {
    return useQuery({
        queryKey: queryKeys.emailSessions(workspaceId),
        queryFn: () => enhancedApiClient.getEmailAgentSessions(workspaceId),
        enabled: !!workspaceId,
        select: (response) => response.success ? response.data : undefined,
    })
}

// Hook for tax assistant sessions
export function useTaxAssistantSessions(workspaceId: string) {
    return useQuery({
        queryKey: queryKeys.taxSessions(workspaceId),
        queryFn: () => enhancedApiClient.getTaxAssistantSessions(workspaceId),
        enabled: !!workspaceId,
        select: (response) => response.success ? response.data : undefined,
    })
}

// Hook for document upload
export function useUploadDocument() {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: ({ clientId, file, metadata }: { 
            clientId: string
            file: File
            metadata?: any 
        }) => enhancedApiClient.uploadDocument(clientId, file, metadata),
        onSuccess: (data, variables) => {
            // Invalidate documents list
            queryClient.invalidateQueries({ 
                queryKey: queryKeys.documents(variables.clientId) 
            })
        },
    })
}

// Hook for workspace chats
export function useWorkspaceChats(workspaceId: string) {
    return useQuery({
        queryKey: queryKeys.chats(workspaceId),
        queryFn: () => enhancedApiClient.getWorkspaceChats(workspaceId),
        enabled: !!workspaceId,
        select: (response) => response.success ? response.data : undefined,
    })
}

// Hook for sending chat messages
export function useSendChatMessage() {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: ({ workspaceId, chatId, message }: { 
            workspaceId: string
            chatId: string
            message: string 
        }) => enhancedApiClient.sendChatMessage(workspaceId, chatId, message),
        onSuccess: (data, variables) => {
            // Invalidate chats to refresh messages
            queryClient.invalidateQueries({ 
                queryKey: queryKeys.chats(variables.workspaceId) 
            })
            // Also invalidate credit usage as chat might consume credits
            queryClient.invalidateQueries({ 
                queryKey: queryKeys.creditUsage(variables.workspaceId) 
            })
        },
    })
}

// Hook for handling API errors
export function useApiErrorHandler() {
    const router = useRouter()
    
    const handleError = (error: ApiResponse<any>) => {
        if (error.status === 401) {
            // Unauthorized - redirect to login
            authService.clearCache()
            router.push('/login')
        } else if (error.status === 403) {
            // Forbidden - show error message
            console.error('Access forbidden:', error.error)
        } else if (error.status >= 500) {
            // Server error - show generic error
            console.error('Server error:', error.error)
        }
        
        return error.error || 'An error occurred'
    }
    
    return { handleError }
}

// Hook for checking if user can perform actions based on credits
export function useCanPerformAction(workspaceId: string, requiredCredits: number = 1) {
    const { data: creditUsage, isLoading } = useCreditUsage(workspaceId)
    
    const canPerform = creditUsage ? creditUsage.remaining >= requiredCredits : false
    
    return {
        canPerform,
        isLoading,
        creditUsage,
        remainingCredits: creditUsage?.remaining || 0,
    }
}
