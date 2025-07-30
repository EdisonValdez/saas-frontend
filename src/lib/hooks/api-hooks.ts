import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, queryKeys, ClientData, DocumentData, SubscriptionLimits } from '@/lib/api-client'
import { toast } from 'sonner'

// Client Management Hooks
export function useWorkspaceClients(workspaceId: string) {
    return useQuery({
        queryKey: queryKeys.clients(workspaceId),
        queryFn: () => apiClient.getWorkspaceClients(workspaceId),
        enabled: !!workspaceId,
        select: (data) => data.data,
    })
}

export function useClient(workspaceId: string, clientId: string) {
    return useQuery({
        queryKey: queryKeys.client(workspaceId, clientId),
        queryFn: () => apiClient.getClient(workspaceId, clientId),
        enabled: !!workspaceId && !!clientId,
        select: (data) => data.data,
    })
}

export function useCreateClient(workspaceId: string) {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: (clientData: Partial<ClientData>) => 
            apiClient.createClient(workspaceId, clientData),
        onSuccess: (response) => {
            if (response.success) {
                queryClient.invalidateQueries({ queryKey: queryKeys.clients(workspaceId) })
                toast.success('Client created successfully')
            } else {
                toast.error(response.error || 'Failed to create client')
            }
        },
        onError: () => {
            toast.error('Failed to create client')
        },
    })
}

export function useUpdateClient(workspaceId: string) {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: ({ clientId, updates }: { clientId: string, updates: Partial<ClientData> }) =>
            apiClient.updateClient(workspaceId, clientId, updates),
        onSuccess: (response, { clientId }) => {
            if (response.success) {
                queryClient.invalidateQueries({ queryKey: queryKeys.clients(workspaceId) })
                queryClient.invalidateQueries({ queryKey: queryKeys.client(workspaceId, clientId) })
                toast.success('Client updated successfully')
            } else {
                toast.error(response.error || 'Failed to update client')
            }
        },
        onError: () => {
            toast.error('Failed to update client')
        },
    })
}

export function useDeleteClient(workspaceId: string) {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: (clientId: string) => apiClient.deleteClient(workspaceId, clientId),
        onSuccess: (response) => {
            if (response.success) {
                queryClient.invalidateQueries({ queryKey: queryKeys.clients(workspaceId) })
                toast.success('Client deleted successfully')
            } else {
                toast.error(response.error || 'Failed to delete client')
            }
        },
        onError: () => {
            toast.error('Failed to delete client')
        },
    })
}

// Document Management Hooks
export function useClientDocuments(clientId: string) {
    return useQuery({
        queryKey: queryKeys.documents(clientId),
        queryFn: () => apiClient.getClientDocuments(clientId),
        enabled: !!clientId,
        select: (data) => data.data,
    })
}

export function useDocument(clientId: string, documentId: string) {
    return useQuery({
        queryKey: queryKeys.document(clientId, documentId),
        queryFn: () => apiClient.getDocument(clientId, documentId),
        enabled: !!clientId && !!documentId,
        select: (data) => data.data,
    })
}

export function useExtractedData(clientId: string, documentId: string) {
    return useQuery({
        queryKey: queryKeys.extractedData(clientId, documentId),
        queryFn: () => apiClient.getExtractedData(clientId, documentId),
        enabled: !!clientId && !!documentId,
        select: (data) => data.data,
    })
}

export function useUploadDocument(clientId: string) {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: ({ file, metadata }: { file: File, metadata?: any }) =>
            apiClient.uploadDocument(clientId, file, metadata),
        onSuccess: (response) => {
            if (response.success) {
                queryClient.invalidateQueries({ queryKey: queryKeys.documents(clientId) })
                toast.success('Document uploaded successfully')
            } else {
                toast.error(response.error || 'Failed to upload document')
            }
        },
        onError: () => {
            toast.error('Failed to upload document')
        },
    })
}

// Subscription and Credit Hooks
export function useCreditUsage(workspaceId: string) {
    return useQuery({
        queryKey: queryKeys.creditUsage(workspaceId),
        queryFn: () => apiClient.getCreditUsage(workspaceId),
        enabled: !!workspaceId,
        select: (data) => data.data,
        refetchInterval: 30000, // Refetch every 30 seconds
    })
}

export function useWorkspaceSubscription(workspaceId: string) {
    return useQuery({
        queryKey: queryKeys.subscription(workspaceId),
        queryFn: () => apiClient.getWorkspaceSubscription(workspaceId),
        enabled: !!workspaceId,
        select: (data) => data.data,
    })
}

// Agent Interaction Hooks
export function useInvokeAgent(workspaceId: string) {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: ({ prompt, context }: { prompt: string, context?: any }) =>
            apiClient.invokeAgent(prompt, workspaceId, context),
        onSuccess: (response) => {
            if (response.success) {
                // Refresh credit usage after AI interaction
                queryClient.invalidateQueries({ queryKey: queryKeys.creditUsage(workspaceId) })
            } else {
                toast.error(response.error || 'Failed to get AI response')
            }
        },
        onError: () => {
            toast.error('Failed to communicate with AI agent')
        },
    })
}

// Chat Hooks
export function useWorkspaceChats(workspaceId: string) {
    return useQuery({
        queryKey: queryKeys.chats(workspaceId),
        queryFn: () => apiClient.getWorkspaceChats(workspaceId),
        enabled: !!workspaceId,
        select: (data) => data.data,
    })
}

export function useSendChatMessage(workspaceId: string) {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: ({ chatId, message }: { chatId: string, message: string }) =>
            apiClient.sendChatMessage(workspaceId, chatId, message),
        onSuccess: (response) => {
            if (response.success) {
                queryClient.invalidateQueries({ queryKey: queryKeys.chats(workspaceId) })
                queryClient.invalidateQueries({ queryKey: queryKeys.creditUsage(workspaceId) })
            } else {
                toast.error(response.error || 'Failed to send message')
            }
        },
        onError: () => {
            toast.error('Failed to send message')
        },
    })
}

// Email Agent Hooks
export function useEmailAgentSessions(workspaceId: string) {
    return useQuery({
        queryKey: queryKeys.emailSessions(workspaceId),
        queryFn: () => apiClient.getEmailAgentSessions(workspaceId),
        enabled: !!workspaceId,
        select: (data) => data.data,
    })
}

export function useCreateEmailAgentSession(workspaceId: string) {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: (data: any) => apiClient.createEmailAgentSession(workspaceId, data),
        onSuccess: (response) => {
            if (response.success) {
                queryClient.invalidateQueries({ queryKey: queryKeys.emailSessions(workspaceId) })
                toast.success('Email session created successfully')
            } else {
                toast.error(response.error || 'Failed to create email session')
            }
        },
        onError: () => {
            toast.error('Failed to create email session')
        },
    })
}

// Tax Assistant Hooks
export function useTaxAssistantSessions(workspaceId: string) {
    return useQuery({
        queryKey: queryKeys.taxSessions(workspaceId),
        queryFn: () => apiClient.getTaxAssistantSessions(workspaceId),
        enabled: !!workspaceId,
        select: (data) => data.data,
    })
}

export function useCreateTaxAssistantSession(workspaceId: string) {
    const queryClient = useQueryClient()
    
    return useMutation({
        mutationFn: (data: any) => apiClient.createTaxAssistantSession(workspaceId, data),
        onSuccess: (response) => {
            if (response.success) {
                queryClient.invalidateQueries({ queryKey: queryKeys.taxSessions(workspaceId) })
                toast.success('Tax assistant session created successfully')
            } else {
                toast.error(response.error || 'Failed to create tax session')
            }
        },
        onError: () => {
            toast.error('Failed to create tax session')
        },
    })
}

// Onboarding Hooks
export function useStartOnboarding() {
    return useMutation({
        mutationFn: (clientData: any) => apiClient.startOnboarding(clientData),
        onSuccess: (response) => {
            if (response.success) {
                toast.success('Client onboarding started')
            } else {
                toast.error(response.error || 'Failed to start onboarding')
            }
        },
        onError: () => {
            toast.error('Failed to start onboarding')
        },
    })
}

export function useOnboardingStatus(sessionId: string) {
    return useQuery({
        queryKey: ['onboardingStatus', sessionId],
        queryFn: () => apiClient.getOnboardingStatus(sessionId),
        enabled: !!sessionId,
        select: (data) => data.data,
        refetchInterval: 2000, // Poll every 2 seconds for status updates
    })
}

export function useConfirmColumnMapping() {
    return useMutation({
        mutationFn: ({ sessionId, mapping }: { sessionId: string, mapping: any }) =>
            apiClient.confirmColumnMapping(sessionId, mapping),
        onSuccess: (response) => {
            if (response.success) {
                toast.success('Column mapping confirmed')
            } else {
                toast.error(response.error || 'Failed to confirm mapping')
            }
        },
        onError: () => {
            toast.error('Failed to confirm mapping')
        },
    })
}
