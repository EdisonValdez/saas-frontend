'use client'

// React imports
import * as React from 'react'

// Next.js imports
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Third-party library imports
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

// Components and utilities
import { cn } from '@/lib/utils'
import { userLoginSchema } from '@/lib/validations/auth'
import { buttonVariants } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Icons } from '@/components/icons'

// UI components
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'

// NextAuth
import { signIn } from 'next-auth/react'

// Types
interface UserLoginProps extends React.HTMLAttributes<HTMLDivElement> {
    returnUrl: string
}

type UserLoginData = z.infer<typeof userLoginSchema>

export function UserLoginForm({ returnUrl, className, ...props }: UserLoginProps) {
    const form = useForm<UserLoginData>({
        resolver: zodResolver(userLoginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    })

    const router = useRouter()
    const { toast } = useToast()


    const { handleSubmit, reset, formState } = form
    const { errors, isSubmitting, isSubmitSuccessful } = formState

    React.useEffect(() => {
        if (isSubmitSuccessful) {
            reset()
        }
    }, [isSubmitSuccessful, reset])

    async function onSubmit(data: UserLoginData) {
        try {
            const signInResult = await signIn('credentials', {
                email: data.email,
                password: data.password,
                redirect: false,
                callbackUrl: returnUrl,
            })

            if (signInResult?.error) {

                let errorMessage = 'An error occurred during login. Please try again.'

                // Provide more specific error messages based on the error type
                if (signInResult.error === 'CredentialsSignin') {
                    errorMessage = 'Invalid email or password. Please check your credentials and try again.'
                } else if (signInResult.error.includes('fetch')) {
                    errorMessage =
                        'Unable to connect to the authentication server. Please check your internet connection and try again.'
                } else if (signInResult.error.includes('timeout')) {
                    errorMessage = 'The login request timed out. Please try again.'
                }

                toast({
                    title: 'Login Error',
                    description: errorMessage,
                    variant: 'destructive',
                })
            } else if (signInResult?.ok || signInResult?.url) {
                console.log('[DEBUG] Login successful, redirecting to:', returnUrl)
                toast({
                    title: 'Success',
                    description: 'You have successfully logged in.',
                })

                // Redirect to the returnUrl
                router.push(returnUrl)
            } else {
                console.error('[DEBUG] Login failed with unknown result:', signInResult)
                toast({
                    title: 'Login Error',
                    description: 'Login failed for an unknown reason. Please try again.',
                    variant: 'destructive',
                })
            }
        } catch (error) {
            console.error('[DEBUG] Login form exception:', error)
            console.error('[DEBUG] Error type:', error instanceof Error ? error.constructor.name : typeof error)
            console.error('[DEBUG] Error message:', error instanceof Error ? error.message : 'Unknown error')
            console.error('[DEBUG] Error stack:', error instanceof Error ? error.stack : 'No stack trace')

            let errorMessage = 'An unexpected error occurred during login. Please try again.'

            if (error instanceof Error) {
                if (error.message.includes('fetch')) {
                    errorMessage = 'Network error: Unable to connect to the authentication server.'
                } else if (error.message.includes('timeout')) {
                    errorMessage = 'Request timeout: The login request took too long to complete.'
                } else if (error.message.includes('JSON')) {
                    errorMessage = 'Server response error: The server returned an invalid response.'
                } else if (error.message) {
                    errorMessage = `Login error: ${error.message}`
                }
            }

            toast({
                title: 'Login Error',
                description: errorMessage,
                variant: 'destructive',
            })
        }
    }



    return (
        <div className={cn('grid gap-6', className)} {...props}>
            <div className="flex flex-col space-y-2 text-center">
                <Icons.logo className="mx-auto h-6 w-6" />
                <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
                <p className="text-sm text-muted-foreground">Enter your email to sign in to your account</p>
            </div>

            <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
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
                                {errors?.email && <FormMessage>{errors.email.message}</FormMessage>}
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
                                        id="password"
                                        placeholder="Your password"
                                        type="password"
                                        autoCapitalize="none"
                                        autoCorrect="off"
                                        disabled={isSubmitting}
                                        {...field}
                                    />
                                </FormControl>
                                {errors?.password && <FormMessage>{errors.password.message}</FormMessage>}
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className={cn(buttonVariants(), 'w-full')} disabled={isSubmitting}>
                        {isSubmitting && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                        Sign in
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                        <Link href="/register" className="hover:text-brand underline underline-offset-4">
                            Don&apos;t have an account? Sign Up
                        </Link>
                    </p>
                    <p className="text-center text-sm text-muted-foreground">
                        <Link href="/reset-password" className="hover:text-brand underline underline-offset-4">
                            Forgot your password?
                        </Link>
                    </p>
                    <p className="text-center text-sm text-muted-foreground">
                        <Link href="/reset-username" className="hover:text-brand underline underline-offset-4">
                            Reset your username?
                        </Link>
                    </p>


                </form>
            </Form>
        </div>
    )
}
