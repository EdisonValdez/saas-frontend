'use client'

import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'

import { cn } from '@/lib/utils'
import { Icons } from '@/components/icons'
import { SidebarNavItem } from '@/types/nav'

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
    items: SidebarNavItem[]
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
    const pathname = usePathname()
    const parts = pathname.split('/')
    const lastPart = parts[parts.length - 1]

    const { workspaceId } = useParams()

    return (
        <nav className={cn('flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1', className)} {...props}>
            {items.map((item, index) => {
                const url = item.href?.slice(1)
                const Icon = Icons[item.icon || 'arrowRight']
                const pathWithWorkspace = workspaceId
                    ? `/dashboard/workspaces/${workspaceId}${item.href}/`
                    : '/${item.href}'

                return (
                    item.href && (
                        <Link key={index} href={item.disabled ? '/' : pathWithWorkspace} scroll={false}>
                            <span
                                className={cn(
                                    'group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                                    lastPart === url ? 'bg-accent' : 'transparent',
                                    item.disabled && 'cursor-not-allowed opacity-80'
                                )}
                            >
                                <Icon className="mr-2 h-4 w-4" />
                                <span>{item.title}</span>
                            </span>
                        </Link>
                    )
                )
            })}
        </nav>
    )
}
