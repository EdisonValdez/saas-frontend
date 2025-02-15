'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

// Config and utility imports
import { siteConfig } from '@/config/site'
import { cleanObject } from '@/lib/utils'
import { cn } from '@/lib/utils'

import { WorkspaceMember } from '@/types/workspaces'

// UI component imports
import { useToast } from '@/components/ui/use-toast'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Schema for validating the role
const updateWorkspaceMembershipSchema = z.object({
    role: z.enum(['member', 'admin'], {
        errorMap: () => ({ message: 'Invalid role selected' }),
    }),
})

interface WorkspaceMemberUpdateFormProps {
    membership: WorkspaceMember
    className?: string
    onSuccess?: () => void
}

type WorkspaceMemberUpdateFormData = z.infer<typeof updateWorkspaceMembershipSchema>

export function WorkspaceMemberUpdateForm({
    membership,
    className,
    onSuccess,
    ...props
}: WorkspaceMemberUpdateFormProps) {
    const { toast } = useToast()
    const router = useRouter()

    const form = useForm<WorkspaceMemberUpdateFormData>({
        resolver: zodResolver(updateWorkspaceMembershipSchema),
        defaultValues: {
            role: membership.role as 'member' | 'admin',
        },
        mode: 'onChange',
    })

    const { handleSubmit, formState, reset } = form
    const { errors, isSubmitting, isSubmitSuccessful } = formState

    React.useEffect(() => {
        if (isSubmitSuccessful) {
            reset()
        }
        if (!isSubmitSuccessful) {
            form.clearErrors()
        }
    }, [isSubmitSuccessful, reset, form])

    async function onSubmit(data: WorkspaceMemberUpdateFormData) {
        const payload: Record<string, any> = {
            ...data,
        }
        const cleanedPayload = cleanObject(payload)

        const UPDATE_MEMBERSHIP_ENDPOINT = `${siteConfig.paths.api.workspaces.workspaces}${membership.workspace}/memberships/${membership.id}/`

        try {
            const response = await fetch(UPDATE_MEMBERSHIP_ENDPOINT, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cleanedPayload),
            })

            if (!response.ok) {
                throw new Error('Failed to update membership')
            }

            toast({
                title: 'Membership Updated',
                description: `The membership was successfully updated to ${data.role}.`,
                variant: 'default',
            })
            onSuccess?.()
            return router.refresh()
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to update membership. Please try again.',
                variant: 'destructive',
            })
        }
    }

    return (
        <div className={cn('', className)} {...props}>
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
                            'Update Membership'
                        )}
                    </Button>
                </form>
            </Form>
        </div>
    )
}
