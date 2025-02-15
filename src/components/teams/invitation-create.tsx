'use client'

import * as React from 'react'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import { siteConfig } from '@/config/site'
import { Team } from '@/types/workspaces'
import { invitationSchema } from '@/lib/validations/workspace'
import { postData, cn } from '@/lib/utils'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Icons } from '@/components/icons'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface InvitationCreateFormProps {
    team: Team
    className?: string
    onSuccess?: (invitationId: string) => void
}

type InvitationCreateFormData = z.infer<typeof invitationSchema>

export function TeamInvitationCreateForm({ team, className, onSuccess, ...props }: InvitationCreateFormProps) {
    const { toast } = useToast()
    const router = useRouter()

    const form = useForm<InvitationCreateFormData>({
        resolver: zodResolver(invitationSchema),
        defaultValues: { email: '', role: 'member' },
        mode: 'onChange',
    })

    const { handleSubmit, reset, formState } = form
    const { errors, isSubmitting, isSubmitSuccessful } = formState

    // Reset form and refresh router on successful submission
    React.useEffect(() => {
        if (isSubmitSuccessful) {
            reset()
        }
    }, [isSubmitSuccessful, reset, router])

    // API call extraction
    async function createInvitation(data: InvitationCreateFormData) {
        return postData({
            url: `${siteConfig.paths.api.workspaces.workspaces}${team.workspace}/teams/${team.id}/invitations`,
            data,
        })
    }

    // Form submission handler
    async function onSubmit(data: InvitationCreateFormData) {
        try {
            const res = await createInvitation(data)

            if (res.status === 201) {
                toast({
                    title: 'Success!',
                    description: `Invitation sent to ${data.email}.`,
                })
                onSuccess?.(res.response.id) // Pass the ID to parent
                return router.refresh()
            } else {
                throw new Error(res.response?.message || 'Failed to create invitation')
            }
        } catch (error: any) {
            console.error('Failed to create invitation', error)
            toast({
                title: 'Error',
                description: error.message || 'Something went wrong. Please try again.',
                variant: 'destructive',
            })
        }
    }

    return (
        <Card className={cn('', className)} {...props}>
            <CardHeader>
                <CardTitle>Send Invitation</CardTitle>
                <CardDescription>Invite team members to your team.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Email Field */}
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                        <Input
                                            id="email"
                                            aria-label="Email Address"
                                            placeholder="john.doe@example.com"
                                            type="email"
                                            autoCapitalize="none"
                                            autoCorrect="off"
                                            disabled={isSubmitting}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage>{errors.email?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        {/* Role Selection */}
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} defaultValue={field.value || 'member'}>
                                            <SelectTrigger aria-labelledby="role-label">
                                                <SelectValue placeholder="Select a role" />
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

                        {/* Submit Button */}
                        <Button type="submit" disabled={isSubmitting} className="w-full">
                            {isSubmitting && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                            Send Invitation
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
