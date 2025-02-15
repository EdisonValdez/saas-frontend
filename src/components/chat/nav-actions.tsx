import * as React from 'react'
import { MoreHorizontal, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar'

interface ActionItem {
    label: string
    icon: LucideIcon
    actionType: string
}

interface NavActionsProps {
    actions: ActionItem[][]
    onActionClick: (actionType: string) => void
}

export function NavActions({ actions, onActionClick }: NavActionsProps) {
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false)

    return (
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 overflow-hidden rounded-lg p-0" align="end">
                <Sidebar collapsible="none" className="bg-transparent">
                    <SidebarContent>
                        {actions.map((group, groupIndex) => (
                            <SidebarGroup key={groupIndex} className="border-b last:border-none">
                                <SidebarGroupContent className="gap-0">
                                    <SidebarMenu>
                                        {group.map((item, itemIndex) => (
                                            <SidebarMenuItem key={itemIndex}>
                                                <SidebarMenuButton onClick={() => onActionClick(item.actionType)}>
                                                    <item.icon className="h-4 w-4" />
                                                    <span>{item.label}</span>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ))}
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </SidebarGroup>
                        ))}
                    </SidebarContent>
                </Sidebar>
            </PopoverContent>
        </Popover>
    )
}
