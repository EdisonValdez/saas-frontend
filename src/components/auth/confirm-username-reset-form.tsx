'use client'

import * as React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { siteConfig } from '@/config/site'
import { cn, postData, splitPath } from '@/lib/utils'
import { usernameRetypeSchema } from '@/lib/validations/auth'
import { useToast } from '@/components/ui/use-toast'
import { Icons } from '@/components/icons'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface ConfirmUsernameResetFormProps extends React.HTMLAttributes<HTMLDivElement> {}

type ConfirmUsernameResetFormData = z.infer<typeof usernameRetypeSchema>

export function ConfirmUsernameResetForm({ className, ...props }: ConfirmUsernameResetFormProps) {
    const router = useRouter()
    const { toast } = useToast()

    const pathname = usePathname()
    const segments = splitPath(pathname)
    const uid = segments[segments.length - 2]
    const token = segments[segments.length - 1]

    const form = useForm<ConfirmUsernameResetFormData>({
        resolver: zodResolver(usernameRetypeSchema),
    })

    const { handleSubmit, formState } = form
    const { errors, isSubmitting } = formState

    async function onSubmit(data: ConfirmUsernameResetFormData) {
        const confirmationData = {
            uid,
            token,
            ...data,
        }

        try {
            const res = await postData({
                url: siteConfig.paths.api.auth.usernameResetConfirm,
                data: confirmationData,
            })

            if (res.status === 400) {
                const errorMessage =
                    res.response.email ||
                    res.response.data[0] ||
                    res.response.data.error ||
                    res.response.data.detail ||
                    res.response.data.uid ||
                    res.response.data.token ||
                    res.response.data.new_email ||
                    res.response.data.re_new_email ||
                    'Something went wrong. Please try again.'

                toast({
                    title: 'Something went wrong.',
                    description: errorMessage,
                    variant: 'destructive',
                })
                return router.refresh()
            }

            if (res.status === 204) {
                toast({
                    title: 'Check your email',
                    description: 'We sent you a link. Be sure to check your spam too.',
                })
            } else {
                toast({
                    title: 'Something went wrong. Please try again.',
                    description: 'We could not send the activation link to your email.',
                    variant: 'destructive',
                })
            }
        } catch (error) {
            toast({
                title: 'Something went wrong.',
                description: 'Your sign-in request failed. Please try again.',
                variant: 'destructive',
            })
        }

        toast({
            title: 'Success',
            description: 'Successfully changed your email',
        })
        return router.push('/login')
    }

    return (
        <div className={cn('grid gap-6', className)} {...props}>
            <div className="flex flex-col space-y-2 text-center">
                <Icons.userRoundCog className="mx-auto h-6 w-6" />
                <h1 className="text-2xl font-semibold tracking-tight">Confirm Username Reset</h1>
                <p className="text-sm text-muted-foreground">Enter your email address to reset your username</p>
            </div>
            <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        name="new_email"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="sr-only">New Email</FormLabel>
                                <FormControl>
                                    <Input
                                        id="newEmail"
                                        placeholder="name@example.com"
                                        type="email"
                                        autoCapitalize="none"
                                        autoComplete="email"
                                        autoCorrect="off"
                                        disabled={isSubmitting}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage>
                                    {errors.new_email && (
                                        <p className="px-1 text-xs text-red-600">{errors.new_email.message}</p>
                                    )}
                                </FormMessage>
                            </FormItem>
                        )}
                    />
                    <FormField
                        name="re_new_email"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="sr-only">Confirm New Email</FormLabel>
                                <FormControl>
                                    <Input
                                        id="reEmail"
                                        placeholder="please re-enter your email"
                                        type="email"
                                        autoCapitalize="none"
                                        autoCorrect="off"
                                        disabled={isSubmitting}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage>
                                    {errors.re_new_email && (
                                        <p className="px-1 text-xs text-red-600">{errors.re_new_email.message}</p>
                                    )}
                                </FormMessage>
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm
                    </Button>
                </form>
            </Form>
        </div>
    )
}
