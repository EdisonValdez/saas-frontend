'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { signOutAction } from '@/lib/actions/sign-out'
import { siteConfig } from '@/config/site'
import { cn, postData } from '@/lib/utils'
import { userEmailSchema } from '@/lib/validations/auth'
import { useToast } from '@/components/ui/use-toast'
import { Icons } from '@/components/icons'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface ResetPasswordFormProps extends React.HTMLAttributes<HTMLDivElement> {}

type ResetPasswordFormData = z.infer<typeof userEmailSchema>

export function ResetPasswordForm({ className, ...props }: ResetPasswordFormProps) {
    const router = useRouter()
    const { toast } = useToast()

    const form = useForm<ResetPasswordFormData>({
        resolver: zodResolver(userEmailSchema),
    })

    const { handleSubmit, formState } = form
    const { errors, isSubmitting } = formState

    async function onSubmit(data: ResetPasswordFormData) {
        try {
            const res = await postData({
                url: siteConfig.paths.api.auth.resetPassword,
                data,
            })

            if (res.status === 400) {
                const errorMessage =
                    res.response.data.new_password ||
                    res.response.data.re_new_password ||
                    res.response.data.current_password ||
                    res.response.data[0] ||
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
                    title: 'Success!',
                    description: 'Email sent. Check your inbox.',
                })
            } else {
                toast({
                    title: 'Something went wrong.',
                    description: 'Reset password failed. Please try again.',
                    variant: 'destructive',
                })
            }
            signOutAction()
        } catch (error) {
            toast({
                title: 'Something went wrong.',
                description: 'Reset password failed. Please try again.',
                variant: 'destructive',
            })
        }

        return router.push('/')
    }

    return (
        <div className={cn('grid gap-6', className)} {...props}>
            <div className="flex flex-col space-y-2 text-center">
                <Icons.fingerprint className="mx-auto h-6 w-6" />
                <h1 className="text-2xl font-semibold tracking-tight">Password Reset</h1>
                <p className="text-sm text-muted-foreground">Enter your email to reset your password</p>
            </div>
            <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        name="email"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="sr-only">Email</FormLabel>
                                <FormControl>
                                    <Input
                                        id="email"
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
                                    {errors.email && (
                                        <p className="px-1 text-xs text-red-600">{errors.email.message}</p>
                                    )}
                                </FormMessage>
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                        Submit
                    </Button>
                    <p className="px-8 text-center text-sm text-muted-foreground">
                        Check your email after submitting the form.
                    </p>
                </form>
            </Form>
        </div>
    )
}
