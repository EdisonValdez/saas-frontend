'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { siteConfig } from '@/config/site'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'

interface ChatDeleteModalProps {
    chatId: string
    workspaceId: string
    isOpen?: boolean
    onClose?: () => void
}

export function ChatDeleteModal({ chatId, workspaceId, isOpen, onClose }: ChatDeleteModalProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const deleteChat = async () => {
        setIsLoading(true)

        try {
            const DELETE_CHAT_API = `${siteConfig.paths.api.workspaces.workspaces}${workspaceId}/chats/${chatId}/`
            const response = await fetch(DELETE_CHAT_API, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            setIsLoading(false)
            onClose?.() // Close the modal on success or failure

            if (response.status === 204) {
                toast({
                    title: 'Success',
                    description: 'Chat deleted successfully',
                })
                router.refresh()
                router.push(`/dashboard/workspaces/${workspaceId}/chat`)
            } else {
                toast({
                    title: 'Failed to delete chat',
                    description: 'Please try again.',
                    variant: 'destructive',
                })
            }
        } catch (error) {
            setIsLoading(false)
            toast({
                title: 'Error',
                description: 'An error occurred while deleting the chat.',
                variant: 'destructive',
            })
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Delete Chat</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this chat? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="destructive" onClick={deleteChat} disabled={isLoading}>
                        Delete chat
                    </Button>
                    <Button variant="secondary" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
