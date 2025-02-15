/* eslint-disable @typescript-eslint/no-unused-vars */

'use client'

import React, { useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChatSession } from '@/types/chat'
import { chatSessionUpdateFormSchema } from '@/lib/validations/chat'
import { siteConfig } from '@/config/site'

interface SettingsFormProps {
    className?: string
    chatSession: ChatSession | undefined | null
}

const aiModelOptions = [
    { label: 'gpt-4o', value: 'gpt-4o' },
    { label: 'gpt-4', value: 'gpt-4' },
    { label: 'gpt-4-1106-preview', value: 'gpt-4-1106-preview' },
    { label: 'gpt-3.5-turbo', value: 'gpt-3.5-turbo' },
    // { label: 'o1 (coming soon)', value: 'o1' },
    // { label: 'o1-mini (coming soon)', value: 'o1-mini' },
    // { label: 'o3-mini (coming soon)', value: 'o3-mini' },
    // { label: 'o1‐preview (coming soon)', value: 'o1-preview' },

    { label: 'gpt-4-turbo', value: 'gpt-4-turbo' },
    { label: 'gpt-3.5-turbo-0125', value: 'gpt-3.5-turbo-0125' },
    { label: 'gemini-1.5-pro', value: 'gemini-1.5-pro' },
    { label: 'gemini-1.5-flash', value: 'gemini-1.5-flash' },

    { label: 'claude 3.5 sonnet', value: 'claude-3-5-sonnet-20240620' },
]

export function ChatSessionSettingsForm({ className, chatSession }: SettingsFormProps) {
    const router = useRouter()

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors, isSubmitting, isSubmitSuccessful },
    } = useForm({
        resolver: zodResolver(chatSessionUpdateFormSchema),
        defaultValues: {
            name: chatSession?.name || '',
            ai_model: chatSession?.ai_model || '',
            temperature: chatSession?.temperature || null,
            top_p: chatSession?.top_p || null,
            top_k: chatSession?.top_k || null,
            max_tokens: chatSession?.max_tokens || null,
        },
    })

    useEffect(() => {
        if (isSubmitSuccessful) {
            reset()
            router.refresh()
        }
    }, [isSubmitSuccessful, reset, router])

    if (!chatSession) {
        return <p>No chat session data available.</p>
    }

    async function onSubmit(data: any) {
        // Convert string values to numbers for appropriate fields
        const transformedData = {
            ...data,
            temperature: data.temperature ? parseFloat(data.temperature) : undefined,
            top_p: data.top_p ? parseFloat(data.top_p) : undefined,
            top_k: data.top_k ? parseInt(data.top_k) : undefined,
            max_tokens: data.max_tokens ? parseInt(data.max_tokens) : undefined,
        }

        // Remove undefined values
        Object.keys(transformedData).forEach((key) => transformedData[key] === undefined && delete transformedData[key])

        const endpoint = `${siteConfig.paths.api.workspaces.workspaces}${chatSession?.workspace.id}/chats/${chatSession?.id}/`

        try {
            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(transformedData),
            })

            if (response.ok) {
                const responseData = await response.json()
            } else {
                console.error('Failed to update chat session:', response.statusText)
            }
        } catch (error) {
            console.error('Failed to update chat session:', error)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={className}>
            <div className="mb-4">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    {...register('name', { required: true })}
                    className="mt-1 p-2 border border-gray-300 rounded-md"
                />
                {errors.name && <p className="text-red-500">This field is required</p>}
            </div>

            <div className="mb-4">
                <Label htmlFor="ai_model">AI Model</Label>
                <Select onValueChange={(value) => setValue('ai_model', value)} defaultValue={chatSession?.ai_model}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>AI Models</SelectLabel>
                            {aiModelOptions.map((option) => (
                                <SelectItem value={option.value} key={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
                {errors.ai_model && <p className="text-red-500">This field is required</p>}
            </div>

            <div className="mb-4">
                <Label htmlFor="temperature">Temperature</Label>
                <Input
                    type="number"
                    step="0.01"
                    min="0.0"
                    max="2.0"
                    id="temperature"
                    {...register('temperature', { required: false, valueAsNumber: true })}
                    className="mt-1 p-2 border border-gray-300 rounded-md"
                />
                {errors.temperature && <p className="text-red-500">{errors.temperature.message}</p>}
            </div>

            <div className="mb-4">
                <Label htmlFor="top_p">Top P</Label>
                <Input
                    type="number"
                    step="0.01"
                    min="0.0"
                    max="1.0"
                    id="top_p"
                    {...register('top_p', { required: false, valueAsNumber: true })}
                    className="mt-1 p-2 border border-gray-300 rounded-md"
                />
                {errors.top_p && <p className="text-red-500">{errors.top_p.message}</p>}
            </div>

            <div className="mb-4">
                <Label htmlFor="top_k">Top K</Label>
                <Input
                    type="number"
                    id="top_k"
                    {...register('top_k', { required: false, valueAsNumber: true })}
                    className="mt-1 p-2 border border-gray-300 rounded-md"
                />
                {errors.top_k && <p className="text-red-500">{errors.top_k.message}</p>}
            </div>

            <div className="mb-4">
                <Label htmlFor="max_tokens">Max Tokens</Label>
                <Input
                    type="number"
                    id="max_tokens"
                    {...register('max_tokens', { required: false, valueAsNumber: true })}
                    className="mt-1 p-2 border border-gray-300 rounded-md"
                />
                {errors.max_tokens && <p className="text-red-500">{errors.max_tokens.message}</p>}
            </div>

            <Button type="submit" disabled={isSubmitting} className="mt-4">
                {isSubmitting ? 'Updating...' : 'Update Chat Session'}
            </Button>
        </form>
    )
}
