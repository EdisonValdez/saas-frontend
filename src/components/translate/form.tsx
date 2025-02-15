'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useParams } from 'next/navigation'

import { siteConfig } from '@/config/site'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ArrowLeftRight } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { Form, FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Icons } from '@/components/icons'

const translationFormSchema = z.object({
    text: z.string().min(1, 'Text to translate is required'),
    source_language: z.string(),
    target_language: z.string(),
    ai_model: z.string().optional(),
})

const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ko', name: 'Korean' },
    // Additional languages as needed
]

export function TranslateForm() {
    const [translatedText, setTranslatedText] = useState<string>('')
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [searchTermFrom, setSearchTermFrom] = useState<string>('') // For "From" language search
    const [searchTermTo, setSearchTermTo] = useState<string>('') // For "To" language search
    const params = useParams<{ workspaceId: string }>()

    const form = useForm({
        resolver: zodResolver(translationFormSchema),
        defaultValues: {
            text: '',
            source_language: 'en',
            target_language: 'es',
            ai_model: 'gpt-4o',
        },
    })

    const { handleSubmit, watch } = form
    const sourceLang = watch('source_language')
    const targetLang = watch('target_language')

    const filteredLanguagesFrom = languages.filter((lang) =>
        lang.name.toLowerCase().includes(searchTermFrom.toLowerCase())
    )
    const filteredLanguagesTo = languages.filter((lang) => lang.name.toLowerCase().includes(searchTermTo.toLowerCase()))

    const handleSwapLanguages = () => {
        form.setValue('source_language', targetLang)
        form.setValue('target_language', sourceLang)
        setTranslatedText('')
    }

    const onSubmit = async (data: any) => {
        setIsSubmitting(true)

        const { text, source_language, target_language, ai_model } = data
        const endpoint = `${siteConfig.paths.api.workspaces.workspaces}${params.workspaceId}/translate/`

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text,
                    source_language,
                    target_language,
                    ai_model,
                }),
            })

            if (!response.ok) {
                const errorDetails = await response.json()
                throw new Error(errorDetails.message || 'Translation failed')
            }

            const result = await response.json()
            setTranslatedText(result.translation || '')
            toast({
                title: 'Translation successful',
                description: 'Your text has been translated.',
                variant: 'default',
            })
        } catch (error) {
            toast({
                title: 'Translation failed',
                description: 'There was an error translating your text. Please try again.',
                variant: 'destructive',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Card className="p-8 max-w-7xl mx-auto mt-10 bg-white dark:bg-gray-900 shadow-md rounded-lg transition-colors duration-300">
            <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-12 gap-6">
                        {/* Source Language & Input Text Area */}
                        <div className="col-span-5 space-y-4">
                            <FormField
                                control={form.control}
                                name="source_language"
                                render={({ field }) => (
                                    <FormItem>
                                        <Label className="text-lg text-gray-700 dark:text-gray-300">From</Label>
                                        <FormControl>
                                            <Select
                                                onValueChange={(value) => {
                                                    field.onChange(value)
                                                    setSearchTermFrom('') // Clear search term after selection
                                                }}
                                                value={field.value}
                                            >
                                                <SelectTrigger className="w-48 h-12">
                                                    <SelectValue placeholder="Select language" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <input
                                                        type="text"
                                                        value={searchTermFrom}
                                                        onChange={(e) => setSearchTermFrom(e.target.value)}
                                                        placeholder="Search language..."
                                                        className="w-full p-2 mb-2 rounded-md text-gray-600 dark:text-gray-300"
                                                    />
                                                    {filteredLanguagesFrom.map((lang) => (
                                                        <SelectItem key={lang.code} value={lang.code}>
                                                            {lang.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Text to translate */}
                            <FormField
                                control={form.control}
                                name="text"
                                render={({ field }) => (
                                    <FormItem>
                                        <Label className="text-lg text-gray-700 dark:text-gray-300">
                                            Text to translate
                                        </Label>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                placeholder="Enter your text here"
                                                rows={8}
                                                className="w-full text-lg bg-gray-50 dark:bg-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 p-4"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Swap Button */}
                        <div className="col-span-2 flex justify-center items-center">
                            <Button
                                onClick={handleSwapLanguages}
                                variant="outline"
                                className="p-4 text-gray-600 dark:text-gray-300"
                            >
                                <ArrowLeftRight className="w-8 h-8" />
                            </Button>
                        </div>

                        {/* Target Language & Output Text Area */}
                        <div className="col-span-5 space-y-4">
                            <FormField
                                control={form.control}
                                name="target_language"
                                render={({ field }) => (
                                    <FormItem>
                                        <Label className="text-lg text-gray-700 dark:text-gray-300">To</Label>
                                        <FormControl>
                                            <Select
                                                onValueChange={(value) => {
                                                    field.onChange(value)
                                                    setSearchTermTo('') // Clear search term after selection
                                                }}
                                                value={field.value}
                                            >
                                                <SelectTrigger className="w-48 h-12">
                                                    <SelectValue placeholder="Select language" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <input
                                                        type="text"
                                                        value={searchTermTo}
                                                        onChange={(e) => setSearchTermTo(e.target.value)}
                                                        placeholder="Search language..."
                                                        className="w-full p-2 mb-2 rounded-md text-gray-600 dark:text-gray-300"
                                                    />
                                                    {filteredLanguagesTo.map((lang) => (
                                                        <SelectItem key={lang.code} value={lang.code}>
                                                            {lang.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Translation Output */}
                            <Textarea
                                value={translatedText}
                                readOnly
                                placeholder="Translation will appear here"
                                rows={8}
                                className="w-full text-lg bg-gray-100 dark:bg-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 p-4"
                            />
                        </div>
                    </div>

                    {/* Translate Button - Aligned to Left */}
                    <div className="flex justify-start mt-6">
                        <Button
                            type="submit"
                            className="w-full max-w-xs py-3 bg-blue-500 text-white text-lg hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                            disabled={isSubmitting}
                        >
                            {isSubmitting && <Icons.spinner className="mr-2" />}
                            Translate
                        </Button>
                    </div>
                </form>
            </Form>
        </Card>
    )
}
