'use client'

import React from 'react'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'

interface DemoLayoutProps {
    children: React.ReactNode
    workspaceId?: string
}

export function DemoLayout({ children, workspaceId }: DemoLayoutProps) {
    return (
        <div className="flex min-h-screen w-full">
            <DashboardSidebar workspaceId={workspaceId} />
            <div className="flex-1 flex flex-col">
                <main className="flex-1 overflow-auto">{children}</main>
            </div>
        </div>
    )
}
