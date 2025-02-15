'use client'
import * as React from 'react'
import { Settings, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer'
import { ChatSession } from '@/types/chat'
import { ChatSessionSettingsForm } from './chat-settings-form'
import { ChatDeleteModal } from './chat-delete-modal'
import { ChatTogglePublicModal } from './chat-toggle-public-modal'
import { NavActions } from './nav-actions'

interface ChatSessionHeaderProps {
    chatSession: ChatSession
}

const navActions = [
    [
        {
            label: 'Make Public',
            icon: Settings,
            actionType: 'togglePublic',
        },
    ],
    [
        {
            label: 'Move to Trash',
            icon: Trash2,
            actionType: 'delete',
        },
    ],
]

export function ChatSessionHeader({ chatSession }: ChatSessionHeaderProps) {
    const [isDeleteModalOpen, setDeleteModalOpen] = React.useState(false)
    const [isTogglePublicModalOpen, setTogglePublicModalOpen] = React.useState(false)

    const handleNavAction = (actionType: string) => {
        if (actionType === 'delete') {
            setDeleteModalOpen(true)
        } else if (actionType === 'togglePublic') {
            setTogglePublicModalOpen(true)
        }
    }

    return (
        <header className="sticky top-0 z-10 flex h-[57px] items-center justify-between border-b bg-background px-4">
            {/* Left Aligned Title */}
            <h1 className="text-xl font-semibold">{chatSession.name}</h1>

            {/* Right Aligned Actions */}
            <div className="flex items-center gap-2">
                {/* Settings Drawer */}
                <Drawer>
                    <DrawerTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Settings className="size-4" />
                            <span className="sr-only">Settings</span>
                        </Button>
                    </DrawerTrigger>
                    <DrawerContent className="max-h-[80vh]">
                        <DrawerHeader>
                            <DrawerTitle>Configuration</DrawerTitle>
                            <DrawerDescription>Configure the settings for the model and messages.</DrawerDescription>
                        </DrawerHeader>
                        <ChatSessionSettingsForm
                            className="grid w-full items-start gap-6 overflow-auto p-4 pt-0"
                            chatSession={chatSession}
                        />
                    </DrawerContent>
                </Drawer>

                {/* Chat Delete Modal */}
                <ChatDeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    chatId={chatSession.id}
                    workspaceId={chatSession.workspace.id}
                />

                {/* Toggle Public Modal */}
                <ChatTogglePublicModal
                    isOpen={isTogglePublicModalOpen}
                    onClose={() => setTogglePublicModalOpen(false)}
                    chatSession={chatSession}
                />

                {/* Navigation Actions */}
                <NavActions actions={navActions} onActionClick={handleNavAction} />
            </div>
        </header>
    )
}
