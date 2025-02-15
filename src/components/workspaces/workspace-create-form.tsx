'use client'

// React imports
import * as React from 'react'

// Next.js imports
import { useRouter } from 'next/navigation'

// Third-party library imports
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

// Config imports
import { siteConfig } from '@/config/site'

// Utility imports
import { cleanObject, cn, postData } from '@/lib/utils' // Import postData here
import { workspaceSchema } from '@/lib/validations/workspace'

// UI component imports
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'

interface WorkspaceCreateFormProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string
    onSuccess?: () => void
}

type WorkspaceCreateFormData = z.infer<typeof workspaceSchema>

export function WorkspaceCreateForm({ className, onSuccess, ...props }: WorkspaceCreateFormProps) {
    const { toast } = useToast()
    const router = useRouter()
    const form = useForm<WorkspaceCreateFormData>({
        resolver: zodResolver(workspaceSchema),
        defaultValues: {
            name: '',
            slug: '',
        },
        mode: 'onChange',
    })

    const { handleSubmit, formState, reset } = form
    const { isSubmitting, isSubmitSuccessful } = formState

    React.useEffect(() => {
        if (isSubmitSuccessful) {
            reset()
        }
        // if (!isSubmitSuccessful) {
        //     form.clearErrors()
        // }
    }, [isSubmitSuccessful, reset, form])

    async function onSubmit(data: WorkspaceCreateFormData) {
        const payload: Record<string, any> = {
            ...data,
        }

        const cleanedPayload = cleanObject(payload)

        try {
            const { response, status, ok } = await postData({
                url: siteConfig.paths.api.workspaces.workspaces,
                data: cleanedPayload, // Use cleaned payload here
            })

            if (ok && status === 201) {
                const id = response?.id
                if (id) {
                    toast({
                        title: 'Success',
                        description: `Workspace created with id ${id} successfully`,
                        variant: 'default',
                    })
                }
                onSuccess?.()
                return router.push(`/dashboard/workspaces/${id}/details`)
            } else {
                toast({
                    title: 'Something went wrong.',
                    description: response || 'Oops! Something went wrong. Please try again.',
                    variant: 'destructive',
                })
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
                <CardTitle>Create Workspace</CardTitle>
                <CardDescription>Create a new workspace and add teams to the workspace</CardDescription>
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
                                    <FormDescription>This is the name of your workspace.</FormDescription>
                                    <FormMessage />
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
                                    <FormDescription>The unique identifier for your workspace.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <span className="mr-2 h-4 w-4 animate-spin">...</span>}
                            Create Workspace
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
