'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

// Config and utility imports
import { siteConfig } from '@/config/site'
import { cn, postData } from '@/lib/utils'
import { userRegisterSchema } from '@/lib/validations/auth'

// UI component imports
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Icons } from '@/components/icons'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

interface UserRegisterFormProps extends React.HTMLAttributes<HTMLDivElement> {}

type UserRegisterFormData = z.infer<typeof userRegisterSchema>

export function UserRegisterForm({ className, ...props }: UserRegisterFormProps) {
    const router = useRouter()
    const { toast } = useToast()

    const form = useForm<UserRegisterFormData>({
        resolver: zodResolver(userRegisterSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            re_password: '',
        },
    })

    const { handleSubmit, formState, reset } = form
    const { errors, isSubmitting, isSubmitSuccessful } = formState

    React.useEffect(() => {
        if (isSubmitSuccessful) {
            reset()
        }
        // if (!isSubmitSuccessful) {
        //     console.log('isSubmitSuccessful', isSubmitSuccessful)
        //     form.clearErrors()
        // }
    }, [isSubmitSuccessful, reset, form])

    async function onSubmit(data: UserRegisterFormData) {
        try {
            const res = await postData({
                url: siteConfig.paths.api.auth.signUp,
                data: data,
            })

            if (res.status === 400) {
                const errorMessage =
                    res.response.data.email ||
                    res.response.data.password ||
                    res.response.data.re_password ||
                    res.response.data.name ||
                    res.response.data.username ||
                    'Something went wrong. Please try again.'

                toast({
                    title: 'Something went wrong while registering.',
                    description: errorMessage,
                    variant: 'destructive',
                })
                return
            }

            if (res.status === 201) {
                toast({
                    title: 'Success!',
                    description: 'Account created. Check your email to activate your account.',
                })
            } else {
                toast({
                    title: 'Something went wrong.',
                    description: 'Your sign-up request failed. Please try again.',
                    variant: 'destructive',
                })
            }
        } catch (error) {
            toast({
                title: 'Something went wrong.',
                description: 'Your sign-up request failed. Please try again.',
                variant: 'destructive',
            })
        }
        return router.push('/login')
    }

    return (
        <div className={cn('grid gap-6', className)} {...props}>
            <div className="flex flex-col space-y-2 text-center">
                <Icons.logo className="mx-auto h-6 w-6" />
                <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
                <p className="text-sm text-muted-foreground">Enter your details below to create your account</p>
            </div>
            <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="John Doe"
                                        disabled={isSubmitting}
                                        {...field}
                                        // onChange={(e) => {
                                        //     field.onChange(e)
                                        //     form.clearErrors('name')
                                        // }}
                                    />
                                </FormControl>
                                <FormMessage>{errors?.name?.message}</FormMessage>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="name@example.com"
                                        type="email"
                                        disabled={isSubmitting}
                                        {...field}
                                        // onChange={(e) => {
                                        //     field.onChange(e)
                                        //     form.clearErrors('email')
                                        // }}
                                    />
                                </FormControl>
                                <FormMessage>{errors?.email?.message}</FormMessage>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Please enter your password"
                                        type="password"
                                        disabled={isSubmitting}
                                        {...field}
                                        // onChange={(e) => {
                                        //     field.onChange(e)
                                        //     form.clearErrors('password')
                                        // }}
                                    />
                                </FormControl>
                                <FormMessage>{errors?.password?.message}</FormMessage>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="re_password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Re-enter Password</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Please re-enter your password"
                                        type="password"
                                        disabled={isSubmitting}
                                        {...field}
                                        // onChange={(e) => {
                                        //     field.onChange(e)
                                        //     form.clearErrors('re_password')
                                        // }}
                                    />
                                </FormControl>
                                <FormMessage>{errors?.re_password?.message}</FormMessage>
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                        Register
                    </Button>
                    <p className="px-8 text-center text-sm text-muted-foreground">
                        By clicking continue, you agree to our{' '}
                        <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
                            Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
                            Privacy Policy
                        </Link>
                        .
                    </p>

                    <p className="px-8 text-center text-sm text-muted-foreground">
                        <Link href="/login" className="hover:text-brand underline underline-offset-4">
                            You already have an account? Login
                        </Link>
                    </p>

                    <p className="px-8 text-center text-sm text-muted-foreground">
                        <Link href="/resend-activation" className="hover:text-brand underline underline-offset-4">
                            Click to send the activation link again
                        </Link>
                    </p>
                </form>
            </Form>
        </div>
    )
}
