'use client'

import * as React from 'react'

import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

// Config and utility imports
import { siteConfig } from '@/config/site'
import { cn, postData } from '@/lib/utils'
import { teamSchema } from '@/lib/validations/workspace'

// Types
import { Workspace } from '@/types/workspaces'

// UI component imports
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { Icons } from '@/components/icons'

interface TeamCreateFormProps extends React.HTMLAttributes<HTMLDivElement> {
    workspace: Workspace
    className?: string
    onSuccess?: () => void
}

type TeamCreateFormData = z.infer<typeof teamSchema>

export function TeamCreateForm({ workspace, className, onSuccess, ...props }: TeamCreateFormProps) {
    const { toast } = useToast()
    const router = useRouter()

    const form = useForm<TeamCreateFormData>({
        resolver: zodResolver(teamSchema),
        defaultValues: {
            name: '',
            slug: '',
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

    async function onSubmit(data: TeamCreateFormData) {
        const WORKSPACE_TEAM_CREATE_API = `${siteConfig.paths.api.workspaces.workspaces}${workspace.id}/teams`

        try {
            const res = await postData({
                url: WORKSPACE_TEAM_CREATE_API,
                data,
            })

            if (res.status === 201) {
                const id = res.response.id
                toast({
                    title: 'Congrats!',
                    description: `Team created with the id ${id} for ${data.name}.`,
                })
                onSuccess?.()
                return router.push(`/dashboard/workspaces/${workspace.id}/teams/${id}`)
            } else {
                toast({
                    title: 'Something went wrong.',
                    description: 'Please try again.',
                    variant: 'destructive',
                })
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to create the team. Please try again.',
                variant: 'destructive',
            })
        }
    }

    return (
        <Card className={cn('overflow-hidden', className)} {...props}>
            <CardHeader>
                <CardTitle>Create Team</CardTitle>
                <CardDescription>Create a new team in your workspace</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Team Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Team Acme" disabled={isSubmitting} {...field} />
                                    </FormControl>
                                    <FormMessage>{errors.name?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Slug (optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="team-acme" disabled={isSubmitting} {...field} />
                                    </FormControl>
                                    <FormMessage>{errors.slug?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        <Button type="submit" disabled={isSubmitting} className="w-full">
                            {isSubmitting && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                            Save
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
