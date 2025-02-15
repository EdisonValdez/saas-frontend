'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'
import { chatSessionCreateFormSchema } from '@/lib/validations/chat'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'

interface ChatSessionCreateFormProps extends React.HTMLAttributes<HTMLDivElement> {
    workspaceId: string
}

type ChatSessionCreateFormData = z.infer<typeof chatSessionCreateFormSchema>

export function ChatSessionCreateForm({ workspaceId, className, ...props }: ChatSessionCreateFormProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isSubmitSuccessful },
    } = useForm<ChatSessionCreateFormData>({
        resolver: zodResolver(chatSessionCreateFormSchema),
    })

    const router = useRouter()
    const { toast } = useToast()

    // Reset form and refresh the page if submission is successful
    useEffect(() => {
        if (isSubmitSuccessful) {
            reset()
            router.refresh() // Refresh the page or state
        }
    }, [isSubmitSuccessful, reset, router])

    async function onSubmit(data: ChatSessionCreateFormData) {
        try {
            const endpoint = `${siteConfig.paths.api.workspaces.workspaces}/${workspaceId}/chats/`
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const errorMessage = `Error: ${response.statusText || 'Unknown error occurred'}`
                throw new Error(errorMessage)
            }

            const responseData = await response.json()
            toast({
                title: 'Chat session created successfully',
                variant: 'default',
            })
            router.push(`/dashboard/workspaces/${workspaceId}/chat/${responseData.id}`)
        } catch (error) {
            console.error('Submission error:', error)
            toast({
                title: 'Error creating chat session',
                description: error instanceof Error ? error.message : 'Please try again later.',
                variant: 'destructive',
            })
        }
    }

    return (
        <Card className={cn('w-full max-w-sm', className)} {...props}>
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">New Chat Session</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">
                            Session Name
                        </Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="Enter session name"
                            disabled={isSubmitting}
                            {...register('name', { required: 'Name is required' })}
                            className="w-full"
                        />
                        {errors?.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                    </div>
                    <Button className="w-full" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            'Create Session'
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
