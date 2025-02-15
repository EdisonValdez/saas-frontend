'use client'

import React from 'react'
import { Metadata } from 'next'
import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Define a Zod schema for form validation
const schema = z.object({
    chatName: z.string().min(1, { message: 'Chat name is required' }),
    firstMessage: z.string().min(1, { message: 'First message is required' }),
})

// Infer the form data type from the Zod schema
type ChatFormInputs = z.infer<typeof schema>

export const metadata: Metadata = {
    title: 'Workspace Home',
    description: 'Welcome to your workspace',
}

export function ChatStartForm() {
    // Initialize useForm with the Zod schema as a resolver
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ChatFormInputs>({
        resolver: zodResolver(schema),
    })

    // Handle form submission
    const onSubmit = (data: ChatFormInputs) => {
        console.log(data)
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div>
                <Label htmlFor="chatName">Chat Name</Label>
                <Input id="chatName" {...register('chatName')} placeholder="Enter the chat name" />
                {/* Display error message if chatName validation fails */}
                {errors.chatName && <p>{errors.chatName.message}</p>}
            </div>
            <div>
                <Label htmlFor="firstMessage">First Message</Label>
                <Input id="firstMessage" {...register('firstMessage')} placeholder="Enter the first message" />
                {/* Display error message if firstMessage validation fails */}
                {errors.firstMessage && <p>{errors.firstMessage.message}</p>}
            </div>
            <Button type="submit">Submit</Button>
        </form>
    )
}
