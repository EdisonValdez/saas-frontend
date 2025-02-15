'use client'

import * as React from 'react'

import { useParams, useRouter } from 'next/navigation'

import { ChevronsUpDown, Plus, Building2 } from 'lucide-react'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'

import { Workspace } from '@/types/workspaces'
import { WorkspaceCreateForm } from '@/components/workspaces/workspace-create-form'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogTrigger } from '@/components/ui/dialog'

export function WorkspaceSwitcher({ workspaces }: { workspaces: Workspace[] }) {
    const router = useRouter()
    const params = useParams()
    const ws = (workspaces.find((ws) => ws.id === params.workspaceId) as Workspace) || workspaces[0]

    const { isMobile } = useSidebar()
    const [activeWorkspace, setActiveWorkspace] = React.useState<Workspace>(ws)

    const [isDialogOpen, setIsDialogOpen] = React.useState(false)

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                <Building2 className="size-4" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{activeWorkspace.name}</span>
                                <span className="truncate text-xs">{activeWorkspace.subscription?.status}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        align="start"
                        side={isMobile ? 'bottom' : 'right'}
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="text-xs text-muted-foreground">Workspaces</DropdownMenuLabel>
                        {workspaces.map((workspace, index) => (
                            <DropdownMenuItem
                                key={workspace.name}
                                onClick={() => {
                                    setActiveWorkspace(workspace)
                                    router.push(`/dashboard/workspaces/${workspace.id}`)
                                }}
                                className="gap-2 p-2"
                            >
                                <div className="flex size-6 items-center justify-center rounded-sm border">
                                    <Building2 className="size-4 shrink-0" />
                                </div>
                                {workspace.name}
                                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <DropdownMenuItem
                                    onSelect={(e) => {
                                        e.preventDefault()
                                        setIsDialogOpen(true)
                                    }}
                                    className="gap-2 p-2"
                                >
                                    <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                                        <Plus className="size-4" />
                                    </div>
                                    <div className="font-medium text-muted-foreground">Create Workspace</div>
                                </DropdownMenuItem>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <WorkspaceCreateForm />
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
