'use client'

import * as React from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Menu, X, Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { siteConfig } from '@/config/site'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'

export const PromptaxNavbar: React.FC = () => {
    const { status } = useSession()
    const [isOpen, setOpen] = useState(false)
    const { theme, setTheme } = useTheme()

    const navigationItems = [
        { title: 'Platform', href: '/platform' },
        { title: 'Docs', href: '/docs' },
        { title: 'Demo', href: '/demo' },
        { title: 'Pricing', href: '/pricing' },
    ]

    return (
        <header className="w-full z-40 fixed top-0 left-0 bg-white/95 backdrop-blur-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2">
                            <Icons.logo className="h-8 w-8" />
                            <span className="font-bold text-xl text-gray-900">{siteConfig.name}</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center space-x-8">
                        {navigationItems.map((item) => (
                            <Link
                                key={item.title}
                                href={item.href}
                                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                            >
                                {item.title}
                            </Link>
                        ))}
                    </nav>

                    {/* Right side actions */}
                    <div className="flex items-center space-x-4">
                        {/* Theme toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="hidden sm:inline-flex"
                        >
                            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            <span className="sr-only">Toggle theme</span>
                        </Button>

                        {/* Auth buttons */}
                        {status === 'unauthenticated' ? (
                            <>
                                <Button variant="ghost" className="hidden sm:inline-flex">
                                    Request Demo
                                </Button>
                                <Link href="/login">
                                    <Button variant="ghost" className="text-gray-600">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                                        Sign Up
                                    </Button>
                                </Link>
                            </>
                        ) : status === 'authenticated' ? (
                            <Link href="/dashboard">
                                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                                    Dashboard
                                </Button>
                            </Link>
                        ) : null}

                        {/* Mobile menu button */}
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="lg:hidden" 
                            onClick={() => setOpen(!isOpen)}
                        >
                            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="lg:hidden">
                    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm" onClick={() => setOpen(false)} />
                    <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
                        <div className="flex items-center justify-between">
                            <Link href="/" className="-m-1.5 p-1.5" onClick={() => setOpen(false)}>
                                <span className="sr-only">{siteConfig.name}</span>
                                <div className="flex items-center space-x-2">
                                    <Icons.logo className="h-8 w-8" />
                                    <span className="font-bold text-xl text-gray-900">{siteConfig.name}</span>
                                </div>
                            </Link>
                            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        <div className="mt-6 flow-root">
                            <div className="-my-6 divide-y divide-gray-500/10">
                                <div className="space-y-2 py-6">
                                    {navigationItems.map((item) => (
                                        <Link
                                            key={item.title}
                                            href={item.href}
                                            className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                                            onClick={() => setOpen(false)}
                                        >
                                            {item.title}
                                        </Link>
                                    ))}
                                </div>
                                <div className="py-6 space-y-2">
                                    {status === 'unauthenticated' ? (
                                        <>
                                            <Link
                                                href="/login"
                                                className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                                                onClick={() => setOpen(false)}
                                            >
                                                Sign In
                                            </Link>
                                            <Link
                                                href="/register"
                                                className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-white bg-purple-600 hover:bg-purple-700"
                                                onClick={() => setOpen(false)}
                                            >
                                                Sign Up
                                            </Link>
                                        </>
                                    ) : status === 'authenticated' ? (
                                        <Link
                                            href="/dashboard"
                                            className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-white bg-purple-600 hover:bg-purple-700"
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
