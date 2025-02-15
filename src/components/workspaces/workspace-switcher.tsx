'use client'

import * as React from 'react'

import { useParams, useRouter } from 'next/navigation'

import { CaretSortIcon, CheckIcon, PlusCircledIcon } from '@radix-ui/react-icons'

import { Workspace } from '@/types/workspaces'

import { cn } from '@/lib/utils'

import { WorkspaceCreateForm } from '@/components/workspaces/workspace-create-form'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command'
import { Dialog, DialogContent, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

type PopoverTriggerProps = React.ComponentPropsWithoutRef<typeof PopoverTrigger>

interface WorkspaceSwitcherProps extends PopoverTriggerProps {
    workspaces: Workspace[]
}
export default function WorkspaceSwitcher({ className, workspaces = [] }: WorkspaceSwitcherProps) {
    const router = useRouter()
    const params = useParams()

    const [open, setOpen] = React.useState(false)

    const [showNewWorkspaceDialog, setShowNewWorkspaceDialog] = React.useState(false)
    const [selectedWorkspace, setSelectedWorkspace] = React.useState<Workspace | null>(null)

    React.useEffect(() => {
        if (Array.isArray(workspaces)) {
            const ws = workspaces.find((ws) => ws.id === params.workspaceId) as Workspace
            if (ws) {
                setSelectedWorkspace(ws)
            } else {
                setSelectedWorkspace(null)
            }
        }
    }, [params, workspaces])

    return (
        <Dialog open={showNewWorkspaceDialog} onOpenChange={setShowNewWorkspaceDialog}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        aria-label="Select a workspace"
                        className={cn('justify-between', className)}
                    >
                        {selectedWorkspace && (
                            <Avatar className="mr-2 h-5 w-5">
                                <AvatarImage
                                    src={`https://avatar.vercel.sh/${selectedWorkspace?.name}.png`}
                                    alt={selectedWorkspace?.name}
                                />
                                <AvatarFallback>SC</AvatarFallback>
                            </Avatar>
                        )}
                        {selectedWorkspace ? selectedWorkspace.name : 'Select a workspace'}
                        <CaretSortIcon className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                    <Command>
                        <CommandList>
                            <CommandInput placeholder="Search workspace..." />
                            <CommandEmpty>No workspace found.</CommandEmpty>
                            {workspaces &&
                                workspaces.length > 0 &&
                                workspaces.map((workspace) => (
                                    <CommandGroup key={workspace.id}>
                                        <CommandItem
                                            key={workspace.id}
                                            onSelect={() => {
                                                setSelectedWorkspace(workspace)
                                                setOpen(false)
                                                router.push(`/dashboard/workspaces/${workspace.id}`)
                                            }}
                                            className="text-sm"
                                        >
                                            <Avatar className="mr-2 h-5 w-5">
                                                <AvatarImage
                                                    src={`https://avatar.vercel.sh/${workspace.id}.png`}
                                                    alt={workspace.name}
                                                    className="grayscale"
                                                />
                                                <AvatarFallback>SC</AvatarFallback>
                                            </Avatar>
                                            {workspace.name}
                                            {selectedWorkspace && (
                                                <CheckIcon
                                                    className={cn(
                                                        'ml-auto h-4 w-4',
                                                        selectedWorkspace.id === workspace.id
                                                            ? 'opacity-100'
                                                            : 'opacity-0'
                                                    )}
                                                />
                                            )}
                                        </CommandItem>
                                    </CommandGroup>
                                ))}
                        </CommandList>
                        <CommandSeparator />
                        <CommandList>
                            <CommandGroup>
                                <DialogTrigger asChild>
                                    <CommandItem
                                        onSelect={() => {
                                            setOpen(false)
                                            setShowNewWorkspaceDialog(true)
                                        }}
                                    >
                                        <PlusCircledIcon className="mr-2 h-5 w-5" />
                                        Create Workspace
                                    </CommandItem>
                                </DialogTrigger>
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            <DialogContent>
                <div>
                    <div className="space-y-4 py-2 pb-4">
                        <div className="space-y-2">
                            <WorkspaceCreateForm />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setShowNewWorkspaceDialog(false)}>
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
