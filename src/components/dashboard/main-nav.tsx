/* eslint-disable @typescript-eslint/no-unused-vars */

'use client'

import * as React from 'react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Menu } from 'lucide-react'

import { siteConfig } from '@/config/site'

import { MainNavItem } from '@/types/nav'
import { UserDetails } from '@/types/auth'
import { Workspace } from '@/types/workspaces'

import { cn } from '@/lib/utils'

import { UserAccountNav } from '@/components/user-account-nav'
import WorkspaceSwitcher from '@/components/workspaces/workspace-switcher'
import { ThemeToggle } from '@/components/theme-toggle'
import { Icons } from '@/components/icons'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

interface MainNavProps {
    items?: MainNavItem[]
    children?: React.ReactNode
    workspaces?: Workspace[]
    user: UserDetails
}

export function DashboardMainNav({ items, children, workspaces = [], user }: MainNavProps) {
    const pathname = usePathname()

    return (
        <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
            <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
                <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold md:text-base">
                    <Icons.logo />
                    <span className="font-bold">{siteConfig.name}</span>
                </Link>
                {workspaces && <WorkspaceSwitcher workspaces={workspaces as Workspace[]} />}

                {items?.map((item) => (
                    <Link
                        key={item.title}
                        href={item.href as string}
                        className={cn('text-muted-foreground transition-colors hover:text-foreground', {
                            'text-foreground': item.href === pathname,
                        })}
                        scroll={false}
                    >
                        {item.title}
                    </Link>
                ))}
            </nav>
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left">
                    <nav className="grid gap-6 text-lg font-medium">
                        <Link href="#" className="flex items-center gap-2 text-lg font-semibold">
                            <Icons.logo />
                            <span className="sr-only">{siteConfig.name}</span>
                        </Link>

                        {items?.map((item) => (
                            <Link
                                key={item.title}
                                href={item.href as string}
                                className={cn('text-muted-foreground hover:text-foreground', {
                                    'text-foreground': item.href === pathname,
                                })}
                                scroll={false}
                            >
                                {item.title}
                            </Link>
                        ))}
                    </nav>
                </SheetContent>
            </Sheet>
            <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
                <div className="ml-auto flex-1 sm:flex-initial">
                    <div className="relative">
                        <ThemeToggle />
                    </div>
                </div>
                {user && <UserAccountNav user={user} />}
            </div>
        </header>
    )
}
