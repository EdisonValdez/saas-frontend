'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { CornerDownLeft, Mic, Paperclip } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { toast } from '@/components/ui/use-toast'
import { siteConfig } from '@/config/site'

import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Icons } from '../icons'
import { messageFormSchema, chatMessagePayloadSchema } from '@/lib/validations/chat'
import { ChatSession } from '@/types/chat'

interface ChatMessageFormProps {
    chatSession: ChatSession
}

type MessageFormData = z.infer<typeof messageFormSchema>
export type ChatMessagePayload = z.infer<typeof chatMessagePayloadSchema>

export function ChatMessageForm({ chatSession }: ChatMessageFormProps) {
    const router = useRouter()

    const form = useForm<MessageFormData>({
        resolver: zodResolver(messageFormSchema),
        defaultValues: {
            content: '', // Ensure initial content is empty
        },
    })

    const { handleSubmit, formState, reset, setFocus } = form
    const { isSubmitting } = formState

    async function onSubmit(data: MessageFormData) {
        const payload: ChatMessagePayload = {
            role: 'user',
            content: data.content,
        }

        if (!payload.content.trim()) {
            toast({
                title: 'Message not sent',
                description: 'Message content is required',
                variant: 'destructive',
            })
            return
        }

        try {
            const endpoint = `${siteConfig.paths.api.workspaces.workspaces}${chatSession.workspace.id}/chats/${chatSession.id}/messages`

            // Enhanced logging for debugging
            console.log('🚀 Sending workspace chat message:', {
                endpoint,
                method: 'POST',
                payload,
                workspaceId: chatSession.workspace.id,
                chatId: chatSession.id,
                timestamp: new Date().toISOString(),
            })

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })

            // Log response details
            console.log('📥 Workspace chat API response:', {
                status: res.status,
                statusText: res.statusText,
                headers: Object.fromEntries(res.headers.entries()),
                ok: res.ok,
                url: res.url,
            })

            if (res.ok) {
                const responseData = await res.json()
                console.log('✅ Workspace chat success response:', responseData)

                toast({
                    title: 'Message sent',
                    description: 'Your message has been sent successfully',
                    variant: 'default',
                })

                reset() // Clear the form inputs only on success
                setFocus('content') // Set focus back to the textarea
                router.refresh() // Refresh router to get new messages if necessary
            } else {
                const errorData = await res.json().catch(() => ({ error: 'Unknown error' }))
                console.error('❌ Workspace chat API error response:', errorData)
                throw new Error(`Error: ${res.status} - ${errorData.error || res.statusText}`)
            }
        } catch (error) {
            console.error('❌ Workspace chat message error:', error)
            toast({
                title: 'Message not sent',
                description: `There was an error sending your message: ${error instanceof Error ? error.message : 'Unknown error'}`,
                variant: 'destructive',
            })
        }
    }

    // Event handler for key press in the Textarea
    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault() // Prevents adding a new line
            handleSubmit(onSubmit)() // Submits the form
        }
    }

    return (
        <Form {...form}>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex items-center w-full max-w-3xl border rounded-lg bg-background focus-within:ring-1 focus-within:ring-ring p-3 space-x-2"
            >
                <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem className="flex-grow">
                            <FormControl>
                                <Textarea
                                    placeholder="Type your message here..."
                                    className="resize-none min-h-[40px] border-0 focus-visible:ring-0"
                                    {...field}
                                    onKeyDown={handleKeyDown} // Add keydown event handler
                                    disabled={isSubmitting} // Disable during submission
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={isSubmitting}>
                                <Paperclip className="size-4" />
                                <span className="sr-only">Attach file</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Attach File</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={isSubmitting}>
                                <Mic className="size-4" />
                                <span className="sr-only">Use Microphone</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Use Microphone</TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <Button type="submit" size="sm" className="gap-1.5" disabled={isSubmitting}>
                    {isSubmitting && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                    <CornerDownLeft className="size-3.5" />
                </Button>
            </form>
        </Form>
    )
}
