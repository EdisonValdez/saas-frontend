'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

// Config and utility imports
import { siteConfig } from '@/config/site'
import { cn, cleanObject } from '@/lib/utils'
import { invitationSchema } from '@/lib/validations/workspace'

// Types
import { Workspace } from '@/types/workspaces'

// UI component imports
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Icons } from '@/components/icons'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface WorkspaceInvitationFormProps extends React.HTMLAttributes<HTMLDivElement> {
    workspace: Workspace
    className?: string
    onSuccess?: () => void
}

type WorkspaceInvitationFormData = z.infer<typeof invitationSchema>

async function sendInvitation(data: WorkspaceInvitationFormData, workspace: Workspace) {
    const payload: Record<string, any> = {
        ...data,
    }
    const cleanedPayload = cleanObject(payload)

    const WORKSPACE_INVITATION_ENDPOINT = `${siteConfig.paths.api.workspaces.workspaces}${workspace.id}/invitations`

    const response = await fetch(WORKSPACE_INVITATION_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedPayload),
    })

    if (!response.ok) {
        throw new Error('Failed to send invitation')
    }

    return response
}

export function WorkspaceInvitationForm({ workspace, className, onSuccess, ...props }: WorkspaceInvitationFormProps) {
    const { toast } = useToast()
    const router = useRouter()

    const form = useForm<WorkspaceInvitationFormData>({
        resolver: zodResolver(invitationSchema),
        defaultValues: {
            email: '',
            role: 'member',
        },
        mode: 'onChange',
    })

    const { handleSubmit, reset, formState } = form
    const { errors, isSubmitting, isSubmitSuccessful } = formState

    React.useEffect(() => {
        if (isSubmitSuccessful) {
            reset()
        }
    }, [isSubmitSuccessful, reset])

    async function onSubmit(data: WorkspaceInvitationFormData) {
        try {
            const response = await sendInvitation(data, workspace)

            if (response.status === 201) {
                toast({
                    title: 'Invitation Sent',
                    description: `An invitation has been successfully sent to ${data.email}.`,
                    variant: 'default',
                })
                onSuccess?.()
                return router.refresh()
            } else {
                throw new Error('Failed to send invitation')
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to send invitation. Please try again.',
                variant: 'destructive',
            })
        }
    }

    return (
        <div className={cn('grid gap-6', className)} {...props}>
            <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="user@example.com"
                                        disabled={isSubmitting}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage>{errors.email?.message}</FormMessage>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Role</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="member">Member</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage>{errors.role?.message}</FormMessage>
                            </FormItem>
                        )}
                    />

                    <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? (
                            <>
                                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            'Send Invitation'
                        )}
                    </Button>
                </form>
            </Form>
        </div>
    )
}
