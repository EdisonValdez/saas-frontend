'use client'

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { authService } from '@/lib/auth-bridge'

interface TestResult {
    endpoint: string
    method: string
    payload: any
    response: any
    status: number
    timestamp: Date
    success: boolean
    error?: string
}

export function ChatApiDebug() {
    const { data: session, status } = useSession()
    const [testMessage, setTestMessage] = useState('Help me classify my tax form')
    const [workspaceId, setWorkspaceId] = useState('')
    const [chatId, setChatId] = useState('')
    const [results, setResults] = useState<TestResult[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const addResult = (result: TestResult) => {
        setResults((prev) => [result, ...prev].slice(0, 10)) // Keep last 10 results
    }

    const testDirectAgentInvoke = async () => {
        setIsLoading(true)
        const timestamp = new Date()

        try {
            console.log('🔍 Testing Direct Agent Invoke API')
            console.log('Endpoint:', '/api/agents/invoke')
            console.log('Method:', 'POST')
            console.log('Payload:', { prompt: testMessage })

            const response = await fetch('/api/agents/invoke', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: testMessage }),
            })

            const responseData = await response.json()

            console.log('📥 Response Status:', response.status)
            console.log('📥 Response Data:', responseData)
            console.log('📥 Response Headers:', Object.fromEntries(response.headers.entries()))

            addResult({
                endpoint: '/api/agents/invoke',
                method: 'POST',
                payload: { prompt: testMessage },
                response: responseData,
                status: response.status,
                timestamp,
                success: response.ok,
                error: response.ok ? undefined : responseData.error || 'Unknown error',
            })

            if (response.ok) {
                toast.success('Direct Agent Invoke API call successful!')
            } else {
                toast.error(`Direct Agent Invoke API failed: ${responseData.error || 'Unknown error'}`)
            }
        } catch (error) {
            console.error('❌ Direct Agent Invoke Error:', error)
            addResult({
                endpoint: '/api/agents/invoke',
                method: 'POST',
                payload: { prompt: testMessage },
                response: null,
                status: 0,
                timestamp,
                success: false,
                error: error instanceof Error ? error.message : 'Network error',
            })
            toast.error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        } finally {
            setIsLoading(false)
        }
    }

    const testEnhancedAgentInvoke = async () => {
        if (!workspaceId) {
            toast.error('Workspace ID is required for enhanced agent invoke')
            return
        }

        setIsLoading(true)
        const timestamp = new Date()

        try {
            const payload = {
                prompt: testMessage,
                workspace_id: workspaceId,
                context: {
                    session_id: 'debug-session',
                    conversation_history: [],
                    source: 'chat-debug',
                },
            }

            console.log('🔍 Testing Enhanced Agent Invoke API')
            console.log('Endpoint:', '/api/agents/invoke')
            console.log('Method:', 'POST')
            console.log('Payload:', payload)

            const response = await fetch('/api/agents/invoke', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })

            const responseData = await response.json()

            console.log('📥 Response Status:', response.status)
            console.log('📥 Response Data:', responseData)

            addResult({
                endpoint: '/api/agents/invoke (Enhanced)',
                method: 'POST',
                payload,
                response: responseData,
                status: response.status,
                timestamp,
                success: response.ok,
                error: response.ok ? undefined : responseData.error || 'Unknown error',
            })

            if (response.ok) {
                toast.success('Enhanced Agent Invoke API call successful!')
            } else {
                toast.error(`Enhanced Agent Invoke API failed: ${responseData.error || 'Unknown error'}`)
            }
        } catch (error) {
            console.error('❌ Enhanced Agent Invoke Error:', error)
            addResult({
                endpoint: '/api/agents/invoke (Enhanced)',
                method: 'POST',
                payload: { prompt: testMessage, workspace_id: workspaceId },
                response: null,
                status: 0,
                timestamp,
                success: false,
                error: error instanceof Error ? error.message : 'Network error',
            })
            toast.error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        } finally {
            setIsLoading(false)
        }
    }

    const testWorkspaceChatMessage = async () => {
        if (!workspaceId || !chatId) {
            toast.error('Workspace ID and Chat ID are required for workspace chat message')
            return
        }

        setIsLoading(true)
        const timestamp = new Date()

        try {
            const endpoint = `/api/workspaces/${workspaceId}/chats/${chatId}/messages`
            const payload = {
                role: 'user',
                content: testMessage,
            }

            console.log('🔍 Testing Workspace Chat Message API')
            console.log('Endpoint:', endpoint)
            console.log('Method:', 'POST')
            console.log('Payload:', payload)

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })

            const responseData = await response.json()

            console.log('📥 Response Status:', response.status)
            console.log('📥 Response Data:', responseData)

            addResult({
                endpoint: `Workspace Chat Message (${workspaceId}/${chatId})`,
                method: 'POST',
                payload,
                response: responseData,
                status: response.status,
                timestamp,
                success: response.ok,
                error: response.ok ? undefined : responseData.error || 'Unknown error',
            })

            if (response.ok) {
                toast.success('Workspace Chat Message API call successful!')
            } else {
                toast.error(`Workspace Chat Message API failed: ${responseData.error || 'Unknown error'}`)
            }
        } catch (error) {
            console.error('❌ Workspace Chat Message Error:', error)
            addResult({
                endpoint: `Workspace Chat Message (${workspaceId}/${chatId})`,
                method: 'POST',
                payload: { role: 'user', content: testMessage },
                response: null,
                status: 0,
                timestamp,
                success: false,
                error: error instanceof Error ? error.message : 'Network error',
            })
            toast.error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        } finally {
            setIsLoading(false)
        }
    }

    const clearResults = () => {
        setResults([])
        toast.success('Results cleared')
    }

    if (status === 'loading') {
        return <div className="p-4">Loading authentication...</div>
    }

    if (status === 'unauthenticated') {
        return (
            <Alert>
                <AlertDescription>Please sign in to test the chat API endpoints.</AlertDescription>
            </Alert>
        )
    }

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Chat API Debug Tool</h1>
                    <p className="text-muted-foreground">Test and monitor chat interface API calls</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Badge variant="outline">User: {session?.user?.email}</Badge>
                    <Badge variant={status === 'authenticated' ? 'default' : 'destructive'}>Auth: {status}</Badge>
                </div>
            </div>

            {/* Test Configuration */}
            <Card>
                <CardHeader>
                    <CardTitle>Test Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Test Message</label>
                        <Textarea
                            value={testMessage}
                            onChange={(e) => setTestMessage(e.target.value)}
                            placeholder="Enter your test message..."
                            className="mt-1"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">Workspace ID (Optional)</label>
                            <Input
                                value={workspaceId}
                                onChange={(e) => setWorkspaceId(e.target.value)}
                                placeholder="Enter workspace ID..."
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Chat ID (Optional)</label>
                            <Input
                                value={chatId}
                                onChange={(e) => setChatId(e.target.value)}
                                placeholder="Enter chat ID..."
                                className="mt-1"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Test Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>API Tests</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button onClick={testDirectAgentInvoke} disabled={isLoading} className="w-full">
                            Test Direct Agent Invoke
                        </Button>
                        <Button
                            onClick={testEnhancedAgentInvoke}
                            disabled={isLoading || !workspaceId}
                            variant="outline"
                            className="w-full"
                        >
                            Test Enhanced Agent Invoke
                        </Button>
                        <Button
                            onClick={testWorkspaceChatMessage}
                            disabled={isLoading || !workspaceId || !chatId}
                            variant="outline"
                            className="w-full"
                        >
                            Test Workspace Chat
                        </Button>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">
                            Open browser DevTools → Network tab to monitor requests
                        </p>
                        <Button onClick={clearResults} variant="ghost" size="sm">
                            Clear Results
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Test Results */}
            <Card>
                <CardHeader>
                    <CardTitle>Test Results ({results.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-96">
                        {results.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No test results yet. Run a test above to see results here.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {results.map((result, index) => (
                                    <div key={index} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                                <Badge variant={result.success ? 'default' : 'destructive'}>
                                                    {result.status}
                                                </Badge>
                                                <span className="font-medium">{result.endpoint}</span>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {result.timestamp.toLocaleTimeString()}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <strong>Payload:</strong>
                                                <pre className="bg-muted p-2 rounded mt-1 overflow-x-auto">
                                                    {JSON.stringify(result.payload, null, 2)}
                                                </pre>
                                            </div>
                                            <div>
                                                <strong>Response:</strong>
                                                <pre className="bg-muted p-2 rounded mt-1 overflow-x-auto">
                                                    {JSON.stringify(result.response, null, 2)}
                                                </pre>
                                            </div>
                                        </div>

                                        {result.error && (
                                            <div className="mt-2">
                                                <Badge variant="destructive" className="mr-2">
                                                    Error
                                                </Badge>
                                                <span className="text-sm text-red-600">{result.error}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    )
}
