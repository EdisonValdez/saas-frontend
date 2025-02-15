import Link from 'next/link'
import { ArrowRightIcon } from '@radix-ui/react-icons'
import { Rocket } from 'lucide-react'

import { Separator } from '@/components/ui/separator'

interface AnnouncementProps {
    text?: string
}

export function Announcement({ text = 'SaaS Starter Kit for serious entrepreneurs' }: AnnouncementProps) {
    return (
        <Link href="/login" className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium">
            <Rocket className="h-4 w-4" /> <Separator className="mx-2 h-4" orientation="vertical" /> <span>{text}</span>
            <ArrowRightIcon className="ml-1 h-4 w-4" />
        </Link>
    )
}
