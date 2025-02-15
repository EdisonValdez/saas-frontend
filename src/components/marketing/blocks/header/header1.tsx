'use client'

import * as React from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Menu, X } from 'lucide-react'
import { siteConfig } from '@/config/site'
import { NavItem } from '@/types/nav'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'

interface MainNavProps {
    navigationItems?: NavItem[]
}

export const Header1: React.FC<MainNavProps> = ({ navigationItems }) => {
    const { status } = useSession()
    const [isOpen, setOpen] = useState(false)

    return (
        <header className="w-full z-40 fixed top-0 left-0 bg-background/80 backdrop-blur-sm border-b">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16 lg:h-20">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2">
                            <Icons.logo className="h-6 w-6" />
                            <span className="inline-block font-bold text-lg">{siteConfig.name}</span>
                        </Link>
                    </div>

                    <NavigationMenu className="hidden lg:flex">
                        <NavigationMenuList>
                            {navigationItems?.map((item) => (
                                <NavigationMenuItem key={item.title}>
                                    {item.href ? (
                                        <Link href={item.href} legacyBehavior passHref>
                                            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                                {item.title}
                                            </NavigationMenuLink>
                                        </Link>
                                    ) : (
                                        <>
                                            <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
                                            <NavigationMenuContent>
                                                <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                                                    <li className="row-span-3">
                                                        <NavigationMenuLink asChild>
                                                            <a className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md">
                                                                <div className="mb-2 mt-4 text-lg font-medium">
                                                                    {item.title}
                                                                </div>
                                                                <p className="text-sm leading-tight text-muted-foreground">
                                                                    {item.description}
                                                                </p>
                                                            </a>
                                                        </NavigationMenuLink>
                                                    </li>
                                                    {item.items?.map((subItem) => (
                                                        <li key={subItem.title}>
                                                            <NavigationMenuLink asChild>
                                                                <Link
                                                                    href={subItem.href as string}
                                                                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                                                >
                                                                    <div className="text-sm font-medium leading-none">
                                                                        {subItem.title}
                                                                    </div>
                                                                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                                                        {subItem.description}
                                                                    </p>
                                                                </Link>
                                                            </NavigationMenuLink>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </NavigationMenuContent>
                                        </>
                                    )}
                                </NavigationMenuItem>
                            ))}
                        </NavigationMenuList>
                    </NavigationMenu>

                    <div className="flex items-center space-x-4">
                        {/* <Link href="/contact" className="hidden lg:inline-flex">
                            <Button variant="ghost">Book a demo</Button>
                        </Link> */}
                        {status === 'unauthenticated' ? (
                            <>
                                <Link href="/login">
                                    <Button variant="outline">Sign in</Button>
                                </Link>
                                <Link href="/register" className="hidden sm:inline-flex">
                                    <Button>Get started</Button>
                                </Link>
                            </>
                        ) : status === 'authenticated' ? (
                            <Link href="/dashboard">
                                <Button variant="outline">Dashboard</Button>
                            </Link>
                        ) : null}
                        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(!isOpen)}>
                            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="lg:hidden">
                    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" />
                    <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-background px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
                        <div className="flex items-center justify-between">
                            <Link href="/" className="-m-1.5 p-1.5">
                                <span className="sr-only">{siteConfig.name}</span>
                                <Icons.logo className="h-8 w-auto" />
                            </Link>
                            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        <div className="mt-6 flow-root">
                            <div className="-my-6 divide-y divide-gray-500/10">
                                <div className="space-y-2 py-6">
                                    {navigationItems?.map((item) => (
                                        <Link
                                            key={item.title}
                                            href={item.href || '#'}
                                            className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 hover:bg-accent"
                                            onClick={() => setOpen(false)}
                                        >
                                            {item.title}
                                        </Link>
                                    ))}
                                </div>
                                <div className="py-6">
                                    {status === 'unauthenticated' ? (
                                        <>
                                            <Link
                                                href="/login"
                                                className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 hover:bg-accent"
                                                onClick={() => setOpen(false)}
                                            >
                                                Log in
                                            </Link>
                                            <Link
                                                href="/register"
                                                className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 hover:bg-accent"
                                                onClick={() => setOpen(false)}
                                            >
                                                Sign up
                                            </Link>
                                        </>
                                    ) : status === 'authenticated' ? (
                                        <Link
                                            href="/dashboard"
                                            className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 hover:bg-accent"
                                            onClick={() => setOpen(false)}
                                        >
                                            Dashboard
                                        </Link>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}
