'use client'

// React imports
import * as React from 'react'

// Next.js imports
import { useRouter } from 'next/navigation'

// Third-party library imports
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

// Config and utility imports
import { siteConfig } from '@/config/site'
import { cn, cleanObject } from '@/lib/utils'
import { workspaceSchema } from '@/lib/validations/workspace'

// Types
import { Workspace } from '@/types/workspaces'

// UI component imports
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Icons } from '@/components/icons'

interface WorkspaceUpdateFormProps extends React.HTMLAttributes<HTMLDivElement> {
    workspace: Workspace | null | undefined
    onSuccess?: () => void
    className?: string
}

type WorkspaceUpdateFormData = z.infer<typeof workspaceSchema>

export function WorkspaceUpdateForm({ workspace, className, onSuccess, ...props }: WorkspaceUpdateFormProps) {
    const { toast } = useToast()
    const router = useRouter()

    const form = useForm<WorkspaceUpdateFormData>({
        defaultValues: {
            name: workspace?.name,
            slug: workspace?.slug,
            status: workspace?.status,
        },
        resolver: zodResolver(workspaceSchema),
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

    async function onSubmit(data: WorkspaceUpdateFormData) {
        const payload: Record<string, any> = {
            ...data,
        }
        const cleanedPayload = cleanObject(payload)

        const WORKSPACE_UPDATE_ENDPOINT = `${siteConfig.paths.api.workspaces.workspaces}${workspace?.id}`

        try {
            const res = await fetch(WORKSPACE_UPDATE_ENDPOINT, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cleanedPayload),
            })

            if (!res.ok) {
                throw new Error('Failed to update workspace')
            }

            if (res.status === 200) {
                const resData = await res.json()
                reset({
                    name: resData.name,
                    slug: resData.slug,
                    status: resData.status,
                })
                toast({
                    title: 'Success!',
                    description: 'Workspace updated successfully.',
                })
                onSuccess?.()
                return router.refresh()
            }
        } catch (error) {
            toast({
                title: 'Something went wrong.',
                description: error instanceof Error ? error.message : 'Oops! Something went wrong. Please try again.',
                variant: 'destructive',
            })
        }
    }

    return (
        <Card className={cn('overflow-hidden', className)} {...props}>
            <CardHeader>
                <CardTitle>Update Workspace</CardTitle>
                <CardDescription>Modify your workspace details and status.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Workspace Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Acme Inc." disabled={isSubmitting} {...field} />
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
                                        <Input placeholder="acme" disabled={isSubmitting} {...field} />
                                    </FormControl>
                                    <FormMessage>{errors.slug?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <FormControl>
                                        <select
                                            className="block w-full rounded-md border px-4 py-2 focus:border-blue-400 dark:bg-gray-800"
                                            disabled={isSubmitting}
                                            {...field}
                                        >
                                            <option value="active">Active</option>
                                            <option value="archived">Archived</option>
                                        </select>
                                    </FormControl>
                                    <FormMessage>{errors.status?.message}</FormMessage>
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
                                'Update Workspace'
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
