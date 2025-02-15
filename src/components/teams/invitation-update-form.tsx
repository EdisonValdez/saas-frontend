'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import { cn } from '@/lib/utils'
import { siteConfig } from '@/config/site'
import { useToast } from '@/components/ui/use-toast'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormControl, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Invitation } from '@/types/workspaces'

const updateInvitationSchema = z.object({
    role: z.enum(['member', 'admin'], {
        errorMap: () => ({ message: 'Invalid role selection' }),
    }),
})

interface TeamInvitationUpdateFormProps {
    invitation: Invitation
    className?: string
    onSuccess?: () => void
}

type TeamInvitationUpdateFormData = z.infer<typeof updateInvitationSchema>

export function TeamInvitationUpdateForm({
    invitation,
    className,
    onSuccess,
    ...props
}: TeamInvitationUpdateFormProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<TeamInvitationUpdateFormData>({
        defaultValues: {
            role: (['member', 'admin'].includes(invitation.role) ? invitation.role : 'member') as 'member' | 'admin',
        },
        resolver: zodResolver(updateInvitationSchema),
        mode: 'onChange',
    })

    const {
        handleSubmit,
        formState: { errors },
    } = form

    const onSubmit = async (data: TeamInvitationUpdateFormData) => {
        setIsLoading(true)

        const UPDATE_INVITATION_API = `${siteConfig.paths.api.workspaces.workspaces}${invitation.workspace}/invitations/${invitation.id}`

        try {
            const response = await fetch(UPDATE_INVITATION_API, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData?.message || 'Failed to update invitation')
            }

            toast({
                title: 'Success',
                description: `The invitation role was updated to ${data.role}.`,
                variant: 'default',
            })

            onSuccess?.()
            router.refresh()
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update invitation. Please try again.',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className={cn('space-y-4', className)} {...props}>
            <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                    <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Role</FormLabel>
                                <FormControl>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="member">Member</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage>{errors.role?.message}</FormMessage>
                            </FormItem>
                        )}
                    />

                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                        Update
                    </Button>
                </form>
            </Form>
        </div>
    )
}
