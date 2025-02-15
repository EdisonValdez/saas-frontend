/* eslint-disable @typescript-eslint/no-unused-vars */

'use client'

// React imports
import * as React from 'react'

// Next.js imports
import { useRouter } from 'next/navigation'

// Third-party library imports
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

// Config imports
import { siteConfig } from '@/config/site'

// Utility imports
import { cleanObject, cn } from '@/lib/utils'
import { teamSchema } from '@/lib/validations/workspace'

// Types imports
import { Team, Workspace } from '@/types/workspaces'

// UI component imports
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Icons } from '@/components/icons'

interface TeamUpdateFormProps extends React.HTMLAttributes<HTMLDivElement> {
    team: Team
    workspace: Workspace
    userWorkspaces: Workspace[]
    className?: string
    onSuccess?: () => void
}

type TeamUpdateFormData = z.infer<typeof teamSchema>

export function TeamUpdateForm({
    workspace,
    team,
    userWorkspaces,
    className,
    onSuccess,
    ...props
}: TeamUpdateFormProps) {
    const router = useRouter()
    const { toast } = useToast()

    const form = useForm<TeamUpdateFormData>({
        defaultValues: {
            name: team?.name,
            slug: team?.slug,
            workspace: team?.workspace,
        },
        resolver: zodResolver(teamSchema),
        mode: 'onChange',
    })

    const { handleSubmit, reset, formState } = form
    const { errors, isSubmitting, isSubmitSuccessful } = formState

    React.useEffect(() => {
        if (isSubmitSuccessful) {
            reset()
        }
        if (!isSubmitSuccessful) {
            form.clearErrors()
        }
    }, [isSubmitSuccessful, reset, form])

    async function onSubmit(data: TeamUpdateFormData) {
        const TEAM_UPDATE_ENDPOINT =
            siteConfig.paths.api.workspaces.workspaces + workspace.id + '/teams/' + team.id + '/'

        const payload: Record<string, any> = {
            ...data,
        }

        const cleanedPayload = cleanObject(payload)

        try {
            const res = await fetch(TEAM_UPDATE_ENDPOINT, {
                method: 'PUT',
                headers: new Headers({
                    'Content-Type': 'application/json',
                }),
                body: JSON.stringify(cleanedPayload),
            })
            const resData = await res.json()
            if (!res.ok) {
                toast({
                    title: 'Something went wrong.',
                    description: 'Oops! Something went wrong. Please try again. Use a different name or slug.',
                    variant: 'destructive',
                })
                throw new Error('Failed to update team')
            }

            if (res.status === 200) {
                toast({
                    title: 'Congrats!',
                    description: 'Your team has been updated.',
                })
                onSuccess?.()
                return router.refresh()
            } else {
                toast({
                    title: 'Something went wrong.',
                    description: 'Please try again. Use a different name or slug.',
                    variant: 'destructive',
                })
            }
        } catch (error) {
            if (error) {
                toast({
                    title: 'Something went wrong.',
                    description:
                        error instanceof Error
                            ? error.message + '. Please try again. Use a different name or slug.'
                            : 'Oops! Something went wrong. Please try again.',
                    variant: 'destructive',
                })
            }
        }
        router.push(`/dashboard/workspaces/${team.workspace}/teams/${team.id}`)
    }

    return (
        <Card className={cn('', className)} {...props}>
            <CardHeader>
                <CardTitle>Update Team</CardTitle>
                <CardDescription>Update your team </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid gap-2">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="name" disabled={isSubmitting} {...field} />
                                        </FormControl>
                                        <FormMessage>{errors?.name?.message}</FormMessage>
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
                                        <FormMessage>{errors?.slug?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="workspace"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Workspace</FormLabel>
                                        <FormControl>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value?.toString() || workspace.id.toString()}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select workspace" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {userWorkspaces?.map((ws) => (
                                                        <SelectItem key={ws.id} value={ws.id.toString()}>
                                                            {ws.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage>{errors?.workspace?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" disabled={isSubmitting} className="w-full">
                                {isSubmitting && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                                Update
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
