'use client'

import * as React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { siteConfig } from '@/config/site'
import { cn, postData, splitPath } from '@/lib/utils'
import { userActivationSchema } from '@/lib/validations/auth'

import { useToast } from '@/components/ui/use-toast'
import { Form, FormControl, FormItem, FormMessage } from '@/components/ui/form'
import { buttonVariants } from '@/components/ui/button'
import { Icons } from '@/components/icons'

interface UserActivationFormProps extends React.HTMLAttributes<HTMLDivElement> {}

type UserActivationData = z.infer<typeof userActivationSchema>

export function UserActivationForm({ className, ...props }: UserActivationFormProps) {
    const router = useRouter()
    const pathname = usePathname()
    const segments = splitPath(pathname)
    const uid = segments[segments.length - 2]
    const token = segments[segments.length - 1]
    const { toast } = useToast()

    const form = useForm<UserActivationData>({
        resolver: zodResolver(userActivationSchema),
        defaultValues: {
            uid,
            token,
        },
    })

    const { handleSubmit, formState } = form
    const { isSubmitting } = formState

    async function onSubmit(data: UserActivationData) {
        try {
            const res = await postData({
                url: siteConfig.paths.api.auth.userActivation,
                data,
            })

            if (res.status === 204) {
                toast({
                    title: 'Success!',
                    description: 'Your account has been activated.',
                })
                return router.push(siteConfig.paths.signIn)
            }

            const errorMessage =
                res.response.data?.uid ||
                res.response.data?.token ||
                res.response.data?.detail ||
                res.response.data?.error ||
                'Something went wrong. Please try again.'

            toast({
                title: 'Something went wrong.',
                description: errorMessage,
                variant: 'destructive',
            })
        } catch (error) {
            toast({
                title: 'Something went wrong.',
                description: 'User activation failed. Please try again.',
                variant: 'destructive',
            })
        }
    }

    return (
        <div className={cn('grid gap-6', className)} {...props}>
            <div className="flex flex-col space-y-2 text-center">
                <Icons.logo className="mx-auto h-6 w-6" />
                <h1 className="text-2xl font-semibold tracking-tight">Activate your account</h1>
                <p className="text-sm text-muted-foreground">Click the button below to activate your account.</p>
            </div>

            <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-2">
                    <FormItem>
                        <FormControl>
                            <button type="submit" className={cn(buttonVariants(), 'w-full')} disabled={isSubmitting}>
                                {isSubmitting && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                                Verify
                            </button>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                </form>
            </Form>
        </div>
    )
}
