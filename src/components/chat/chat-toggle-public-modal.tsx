'use client'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { siteConfig } from '@/config/site'
import { ChatSession } from '@/types/chat'

interface ChatTogglePublicModalProps {
    chatSession: ChatSession
    isOpen: boolean
    onClose: () => void
}

interface FormData {
    email?: string
}

export function ChatTogglePublicModal({ chatSession, isOpen, onClose }: ChatTogglePublicModalProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isPublic, setIsPublic] = useState<boolean>(chatSession.public)
    const [shareableLink, setShareableLink] = useState<string | null>(
        `${siteConfig.url}chats/${chatSession.workspace.id}/${chatSession.shareable_link}` || null
    )
    const { toast } = useToast()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>()

    const togglePublic = async () => {
        setIsLoading(true)

        const TOGGLE_PUBLIC_API = `${siteConfig.paths.api.workspaces.workspaces}${chatSession.workspace.id}/chats/${chatSession.id}/toggle-public/`

        try {
            const response = await fetch(TOGGLE_PUBLIC_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            setIsLoading(false)

            if (!response.ok) {
                toast({
                    title: 'Something went wrong.',
                    description: response.statusText,
                    variant: 'destructive',
                })
                throw new Error('Failed to update chat session')
            }

            const result = await response.json()
            if (result.status) {
                toast({
                    title: 'Success',
                    description: `Session is now ${isPublic ? 'private' : 'public'}.`,
                    variant: 'default',
                })
                setIsPublic(!isPublic)
                if (result.shareable_link) {
                    const fullShareableLink = `${siteConfig.url}chats/${chatSession.workspace.id}/${result.shareable_link}`
                    setShareableLink(fullShareableLink)
                } else {
                    setShareableLink(null)
                }
            }
            router.refresh()
        } catch (error) {
            console.error('Failed to update chat session:', error)
        }
    }

    const inviteUser = async (data: FormData) => {
        setIsLoading(true)

        const ADD_USER_API = `${siteConfig.paths.api.workspaces.workspaces}${chatSession.workspace.id}/chats/${chatSession.id}/invite-user/`

        try {
            const response = await fetch(ADD_USER_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: data.email }),
            })

            setIsLoading(false)

            if (!response.ok) {
                toast({
                    title: 'Something went wrong.',
                    description: response.statusText,
                    variant: 'destructive',
                })
                throw new Error('Failed to invite user')
            }

            toast({
                title: 'Success',
                description: 'User has been invited successfully.',
                variant: 'default',
            })
        } catch (error) {
            console.error('Failed to invite user:', error)
        }
    }

    const copyToClipboard = (link: string) => {
        navigator.clipboard.writeText(link)
        toast({
            title: 'Copied!',
            description: 'The shareable link has been copied to your clipboard.',
            variant: 'default',
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="p-6 space-y-6">
                <DialogHeader>
                    <DialogTitle className="text-center text-lg font-semibold">
                        {isPublic ? 'Manage Sharing' : 'Make Chat Public or Invite Users'}
                    </DialogTitle>
                </DialogHeader>

                {/* Toggle Public Button */}
                <DialogDescription className="flex justify-center">
                    <Button className="w-full max-w-xs" onClick={togglePublic} disabled={isLoading}>
                        {isPublic ? 'Make Private' : 'Make Public'}
                    </Button>
                </DialogDescription>

                {/* Invite User Form */}
                <DialogDescription>
                    <form onSubmit={handleSubmit(inviteUser)} className="space-y-3">
                        <Label htmlFor="email">Invite User by Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="user@example.com"
                            {...register('email', { required: true })}
                            disabled={isLoading}
                            className="w-full"
                        />
                        {errors.email && (
                            <span className="text-red-500 text-sm">Please enter a valid email address.</span>
                        )}
                        <DialogFooter>
                            <Button className="w-full max-w-xs" variant="default" type="submit" disabled={isLoading}>
                                Invite
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogDescription>

                {/* Shareable Link Section */}
                {shareableLink && (
                    <div className="space-y-2">
                        <Label>Shareable Link</Label>
                        <div className="flex items-center gap-2">
                            <Input value={shareableLink} readOnly className="flex-1" />
                            <Button variant="outline" onClick={() => copyToClipboard(shareableLink)}>
                                Copy
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
