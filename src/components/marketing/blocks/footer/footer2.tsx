import * as React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Icons } from '@/components/icons'
import { ModeToggle } from '@/components/mode-toggle'
import { siteConfig } from '@/config/site'

export function Footer2({ className }: React.HTMLAttributes<HTMLElement>) {
    return (
        <footer className={cn('border-t bg-background', className)}>
            <div className="container flex flex-col items-center justify-between gap-4 py-6 md:h-24 md:flex-row md:py-0">
                <div className="flex flex-col items-center gap-4 md:flex-row md:gap-2">
                    <Link href="/" className="flex items-center space-x-2">
                        <Icons.logo className="h-6 w-6" />
                        <span className="font-bold">{siteConfig.name}</span>
                    </Link>
                    <p className="text-center text-sm text-muted-foreground md:text-left">
                        © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
                    </p>
                </div>
                <div className="flex items-center space-x-1">
                    <Link
                        href={siteConfig.links.github}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <Icons.gitHub className="h-5 w-5" />
                        <span className="sr-only">GitHub</span>
                    </Link>
                    <Link
                        href={siteConfig.links.twitter}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <Icons.twitter className="h-5 w-5" />
                        <span className="sr-only">Twitter</span>
                    </Link>
                    <ModeToggle />
                </div>
            </div>
        </footer>
    )
}
