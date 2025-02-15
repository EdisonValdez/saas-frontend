import * as React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ModeToggle } from '@/components/mode-toggle'
import { siteConfig } from '@/config/site'
import { Icons } from '@/components/icons'

export function Footer1({ className }: React.HTMLAttributes<HTMLElement>) {
    return (
        <footer className={cn('bg-background', className)}>
            <div className="container px-4 py-12 mx-auto">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    <div className="col-span-1 lg:col-span-4">
                        <Link href="/" className="flex items-center space-x-2">
                            <Icons.logo className="w-6 h-6" />
                            <span className="font-bold">{siteConfig.name}</span>
                        </Link>
                        <p className="mt-4 text-sm text-muted-foreground">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
                            labore et dolore magna aliqua.
                        </p>
                        <div className="flex mt-6 space-x-4">
                            <Link href="#" className="text-muted-foreground hover:text-primary">
                                <span className="sr-only">Facebook</span>
                                <Icons.facebook className="w-6 h-6" />
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary">
                                <span className="sr-only">Twitter</span>
                                <Icons.twitter className="w-6 h-6" />
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary">
                                <span className="sr-only">GitHub</span>
                                <Icons.gitHub className="w-6 h-6" />
                            </Link>
                        </div>
                    </div>
                    <div className="col-span-1 lg:col-span-2">
                        <h3 className="font-semibold">About</h3>
                        <ul className="mt-4 space-y-2">
                            <li>
                                <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                                    Company
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                                    Careers
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div className="col-span-1 lg:col-span-2">
                        <h3 className="font-semibold">Blog</h3>
                        <ul className="mt-4 space-y-2">
                            <li>
                                <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                                    Travel
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div className="col-span-1 lg:col-span-2">
                        <h3 className="font-semibold">Legal</h3>
                        <ul className="mt-4 space-y-2">
                            <li>
                                <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                                    Cookie Policy
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div className="col-span-1 lg:col-span-2">
                        <h3 className="font-semibold">Contact</h3>
                        <ul className="mt-4 space-y-2">
                            <li className="text-sm text-muted-foreground">support@Acme.com</li>
                        </ul>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-between pt-8 mt-8 border-t border-border md:flex-row">
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
                    </p>
                    <ModeToggle />
                </div>
            </div>
        </footer>
    )
}
