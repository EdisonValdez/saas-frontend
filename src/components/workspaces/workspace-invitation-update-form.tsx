'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

// Config and utility imports
import { siteConfig } from '@/config/site'
import { cn, cleanObject } from '@/lib/utils'

// Types
import { Invitation } from '@/types/workspaces'

// UI component imports
import { useToast } from '@/components/ui/use-toast'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Validation schema
const updateInvitationSchema = z.object({
    role: z.enum(['member', 'admin'], {
        errorMap: () => ({ message: 'Invalid role selected' }),
    }),
})

interface WorkspaceInvitationUpdateFormProps {
    invitation: Invitation
    className?: string
    onSuccess?: () => void
}

type WorkspaceInvitationUpdateFormData = z.infer<typeof updateInvitationSchema>

export function WorkspaceInvitationUpdateForm({
    invitation,
    className,
    onSuccess,
    ...props
}: WorkspaceInvitationUpdateFormProps) {
    const router = useRouter()
    const { toast } = useToast()

    const form = useForm<WorkspaceInvitationUpdateFormData>({
        resolver: zodResolver(updateInvitationSchema),
        defaultValues: {
            role: invitation.role as 'member' | 'admin',
        },
        mode: 'onChange',
    })

    const { handleSubmit, formState } = form
    const { errors, isSubmitting } = formState

    async function onSubmit(data: WorkspaceInvitationUpdateFormData) {
        const payload: Record<string, any> = {
            ...data,
        }
        const cleanedPayload = cleanObject(payload)

        const WORKSPACE_INVIATION_UPDATE_API = `${siteConfig.paths.api.workspaces.workspaces}${invitation.workspace}/invitations/${invitation.id}`

        try {
            const response = await fetch(WORKSPACE_INVIATION_UPDATE_API, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cleanedPayload),
            })

            if (!response.ok) {
                throw new Error('Failed to update invitation')
            }

            if (response.status === 200) {
                toast({
                    title: 'Invitation Updated',
                    description: `The invitation role was successfully updated to ${data.role}.`,
                    variant: 'default',
                })
                onSuccess?.()
                return router.refresh()
            } else {
                throw new Error('Failed to update invitation')
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to update invitation. Please try again.',
                variant: 'destructive',
            })
        }
        return router.refresh()
    }

    return (
        <div className={cn(className)} {...props}>
            <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                                Updating...
                            </>
                        ) : (
                            'Update Invitation'
                        )}
                    </Button>
                </form>
            </Form>
        </div>
    )
}
