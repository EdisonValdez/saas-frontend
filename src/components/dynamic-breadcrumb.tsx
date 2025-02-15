'use client'

import React from 'react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

function fromPathtoBreadcrumb(path: string) {
    const parts = path.split('/')
    const breadcrumb = parts.map((part, index) => {
        return {
            name: part,
            href: parts.slice(0, index + 1).join('/'),
        }
    })
    return breadcrumb
}

export function DynamicBreadcrumb() {
    const pathname = usePathname()
    return (
        <div>
            <Breadcrumb className="hidden md:flex">
                <BreadcrumbList>
                    {fromPathtoBreadcrumb(pathname).map((item, index) => {
                        return (
                            <React.Fragment key={index}>
                                <BreadcrumbItem key={index} className="hidden md:block">
                                    <BreadcrumbLink asChild>
                                        <Link href={item.href}>{item.name}</Link>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                {index < fromPathtoBreadcrumb(pathname).length - 1 && index !== 0 && (
                                    <BreadcrumbSeparator className="hidden md:block" />
                                )}
                            </React.Fragment>
                        )
                    })}
                </BreadcrumbList>
            </Breadcrumb>
        </div>
    )
}
