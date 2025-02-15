// import Link from 'next/link'
// import { Link as LinkIcon } from 'lucide-react'

import { PlusCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { ChatSessionCreateForm } from '@/components/chat/chat-session-create-form'

interface ChatSessionCreateFormProps {
    workspaceId: string
}

export function ChatSessionCreatemodal({ workspaceId }: ChatSessionCreateFormProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="sm" className="h-8 gap-1">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Chat</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Start chatting</DialogTitle>
                    <DialogDescription>
                        You can update your chat session settings after you create it.
                    </DialogDescription>
                </DialogHeader>
                <ChatSessionCreateForm workspaceId={workspaceId} />
                {/* <DialogFooter>
                    <Link href="/">Some prompt ideas</Link>
                    <LinkIcon />
                </DialogFooter> */}
            </DialogContent>
        </Dialog>
    )
}
