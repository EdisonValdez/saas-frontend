'use client'

import * as React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { siteConfig } from '@/config/site'
import { cn, postData, splitPath } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import { Icons } from '@/components/icons'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'

import { passwordRetpeSchema } from '@/lib/validations/auth'

interface ConfirmPasswordResetFormProps extends React.HTMLAttributes<HTMLDivElement> {}

type ConfirmPasswordResetFormData = z.infer<typeof passwordRetpeSchema>

export function ConfirmPasswordResetForm({ className, ...props }: ConfirmPasswordResetFormProps) {
    const router = useRouter()
    const pathname = usePathname()
    const { toast } = useToast()

    const form = useForm<ConfirmPasswordResetFormData>({
        resolver: zodResolver(passwordRetpeSchema),
    })

    const { handleSubmit, formState } = form
    const { errors, isSubmitting } = formState

    const segments = splitPath(pathname)
    const uid = segments[segments.length - 2]
    const token = segments[segments.length - 1]

    async function onSubmit(data: ConfirmPasswordResetFormData) {
        const confirmationData = { uid, token, ...data }

        try {
            const res = await postData({
                url: siteConfig.paths.api.auth.passwordResetConfirm,
                data: confirmationData,
            })

            if (res.status === 400) {
                const errorMessage =
                    res.response.data.uid ||
                    res.response.data.token ||
                    res.response.data.detail ||
                    res.response.data.new_password ||
                    res.response.data.re_new_password ||
                    res.response.data[0] ||
                    res.response.data ||
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
                    title: 'Password reset successfully.',
                    description: 'You can now log in with your new password.',
                })
                return router.push('/login')
            } else {
                toast({
                    title: 'Something went wrong.',
                    description: 'Password reset failed. Please try again.',
                    variant: 'destructive',
                })
            }
        } catch (error) {
            toast({
                title: 'Something went wrong.',
                description: 'Password reset failed. Please try again.',
                variant: 'destructive',
            })
        }
    }

    return (
        <div className={cn('grid gap-6', className)} {...props}>
            <div className="flex flex-col space-y-2 text-center">
                <Icons.fingerprint className="mx-auto h-6 w-6" />
                <h1 className="text-2xl font-semibold tracking-tight">Confirm Password Reset</h1>
            </div>
            <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="new_password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="sr-only">New Password</FormLabel>
                                <FormControl>
                                    <Input
                                        id="newPassword"
                                        placeholder="Please enter your new password"
                                        type="password"
                                        autoCapitalize="none"
                                        autoCorrect="off"
                                        disabled={isSubmitting}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage>{errors?.new_password?.message}</FormMessage>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="re_new_password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="sr-only">Re-enter Password</FormLabel>
                                <FormControl>
                                    <Input
                                        id="reNewPassword"
                                        placeholder="Please re-enter your password"
                                        type="password"
                                        autoCapitalize="none"
                                        autoCorrect="off"
                                        disabled={isSubmitting}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage>{errors?.re_new_password?.message}</FormMessage>
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
