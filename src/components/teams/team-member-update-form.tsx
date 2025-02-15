'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { Team, TeamMember } from '@/types/workspaces'
import { siteConfig } from '@/config/site'
import { useToast } from '@/components/ui/use-toast'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormControl, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'

const updateTeamMembershipSchema = z.object({
    role: z.string().refine((role) => ['member', 'admin'].includes(role), {
        message: 'Invalid role',
    }),
})

type FormData = z.infer<typeof updateTeamMembershipSchema>

interface TeamMemberUpdateFormProps {
    team: Team
    membership: TeamMember
    className?: string
    onSuccess?: () => void
}

export function TeamMemberUpdateForm({ team, membership, className, onSuccess }: TeamMemberUpdateFormProps) {
    const form = useForm<FormData>({
        resolver: zodResolver(updateTeamMembershipSchema),
        defaultValues: {
            role: membership.role || 'member',
        },
    })

    const router = useRouter()
    const { toast } = useToast()

    async function onSubmit(data: FormData) {
        const UPDATE_MEMBERSHIP_ENDPOINT = `${siteConfig.paths.api.workspaces.workspaces}${team.workspace}/teams/${team.id}/memberships/${membership.id}/`

        try {
            const response = await fetch(UPDATE_MEMBERSHIP_ENDPOINT, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                throw new Error('Failed to update membership')
            }

            toast({
                title: 'Membership Updated',
                description: `The membership was successfully updated to ${data.role}.`,
            })
            onSuccess?.()
            return router.refresh()
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update membership. Please try again.',
                variant: 'destructive',
            })
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={`space-y-6 ${className}`}>
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
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
                    {form.formState.isSubmitting && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                    Update
                </Button>
            </form>
        </Form>
    )
}
