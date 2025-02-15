'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import {
    ArrowLeftRight,
    Check,
    ChevronDown,
    Mic,
    Volume2,
    RotateCcw,
    RotateCw,
    ThumbsUp,
    ThumbsDown,
    Copy,
} from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { siteConfig } from '@/config/site'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { cn } from '@/lib/utils'

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const translationFormSchema = z.object({
    text: z.string().min(1, 'Text to translate is required'),
    source_language: z.string().min(1, 'Source language is required'),
    target_language: z.string().min(1, 'Target language is required'),
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
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'bn', name: 'Bengali' },
    { code: 'nl', name: 'Dutch' },
    { code: 'sv', name: 'Swedish' },
    { code: 'pl', name: 'Polish' },
    { code: 'tr', name: 'Turkish' },
    { code: 'vi', name: 'Vietnamese' },
    { code: 'th', name: 'Thai' },
    { code: 'id', name: 'Indonesian' },
]

export default function TranslateForm() {
    const [translatedText, setTranslatedText] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const params = useParams<{ workspaceId: string }>()

    const form = useForm<z.infer<typeof translationFormSchema>>({
        resolver: zodResolver(translationFormSchema),
        defaultValues: {
            text: '',
            source_language: 'en',
            target_language: 'fr',
            ai_model: 'gpt-4o',
        },
    })

    const { handleSubmit, watch } = form
    const sourceLang = watch('source_language')
    const targetLang = watch('target_language')

    const handleSwapLanguages = () => {
        form.setValue('source_language', targetLang)
        form.setValue('target_language', sourceLang)
        setTranslatedText('')
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(translatedText)
        toast({
            title: 'Copied!',
            description: 'The translated text has been copied to your clipboard.',
            variant: 'default',
        })
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
        <Card className="w-full max-w-7xl mx-auto p-6">
            <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="flex justify-between items-center space-x-4">
                        <FormField
                            control={form.control}
                            name="source_language"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn(
                                                        'w-full justify-between',
                                                        !field.value && 'text-muted-foreground'
                                                    )}
                                                >
                                                    {field.value
                                                        ? languages.find((language) => language.code === field.value)
                                                              ?.name
                                                        : 'Select language'}
                                                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[200px] p-0">
                                            <Command>
                                                <CommandInput placeholder="Search language..." />
                                                <CommandEmpty>No language found.</CommandEmpty>
                                                <CommandGroup>
                                                    {languages.map((language) => (
                                                        <CommandItem
                                                            value={language.name}
                                                            key={language.code}
                                                            onSelect={() => {
                                                                form.setValue('source_language', language.code)
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    'mr-2 h-4 w-4',
                                                                    language.code === field.value
                                                                        ? 'opacity-100'
                                                                        : 'opacity-0'
                                                                )}
                                                            />
                                                            {language.name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </FormItem>
                            )}
                        />

                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={handleSwapLanguages}
                            className="flex-shrink-0"
                        >
                            <ArrowLeftRight className="h-4 w-4" />
                            <span className="sr-only">Swap languages</span>
                        </Button>

                        <FormField
                            control={form.control}
                            name="target_language"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn(
                                                        'w-full justify-between',
                                                        !field.value && 'text-muted-foreground'
                                                    )}
                                                >
                                                    {field.value
                                                        ? languages.find((language) => language.code === field.value)
                                                              ?.name
                                                        : 'Select language'}
                                                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[200px] p-0">
                                            <Command>
                                                <CommandInput placeholder="Search language..." />
                                                <CommandEmpty>No language found.</CommandEmpty>
                                                <CommandGroup>
                                                    {languages.map((language) => (
                                                        <CommandItem
                                                            value={language.name}
                                                            key={language.code}
                                                            onSelect={() => {
                                                                form.setValue('target_language', language.code)
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    'mr-2 h-4 w-4',
                                                                    language.code === field.value
                                                                        ? 'opacity-100'
                                                                        : 'opacity-0'
                                                                )}
                                                            />
                                                            {language.name}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="text"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter text to translate"
                                            className="min-h-[200px] resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormItem>
                            <FormControl>
                                <Textarea
                                    value={translatedText}
                                    readOnly
                                    placeholder="Translation will appear here"
                                    className="min-h-[200px] resize-none"
                                />
                            </FormControl>
                        </FormItem>
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="flex space-x-2">
                            <Button type="button" variant="ghost" size="icon">
                                <Mic className="h-4 w-4" />
                                <span className="sr-only">Microphone</span>
                            </Button>
                            <Button type="button" variant="ghost" size="icon">
                                <Volume2 className="h-4 w-4" />
                                <span className="sr-only">Listen</span>
                            </Button>
                            <Button type="button" variant="ghost" size="icon">
                                <RotateCcw className="h-4 w-4" />
                                <span className="sr-only">Undo</span>
                            </Button>
                            <Button type="button" variant="ghost" size="icon">
                                <RotateCw className="h-4 w-4" />
                                <span className="sr-only">Redo</span>
                            </Button>
                        </div>
                        <div className="flex space-x-2">
                            <Button type="button" variant="ghost" size="icon">
                                <Volume2 className="h-4 w-4" />
                                <span className="sr-only">Listen</span>
                            </Button>
                            <Button type="button" variant="ghost" size="icon">
                                <ThumbsUp className="h-4 w-4" />
                                <span className="sr-only">Thumbs up</span>
                            </Button>
                            <Button type="button" variant="ghost" size="icon">
                                <ThumbsDown className="h-4 w-4" />
                                <span className="sr-only">Thumbs down</span>
                            </Button>
                            <Button type="button" variant="ghost" size="icon" onClick={handleCopy}>
                                <Copy className="h-4 w-4" />
                                <span className="sr-only">Copy</span>
                            </Button>
                            {/* <Button type="button" variant="ghost" size="icon" >
                                <Share2 className="h-4 w-4" />
                                <span className="sr-only">Share</span>
                            </Button> */}
                        </div>
                    </div>

                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Translating...' : 'Translate'}
                    </Button>
                </form>
            </Form>
        </Card>
    )
}
