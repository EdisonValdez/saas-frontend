import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function PaymentCencelledPage() {
    return (
        <>
            <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
                <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
                    <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">Payment was cancelled</h1>
                    <Link href="/dashboard">
                        <Button>Go to dashboard</Button>
                    </Link>
                </div>
            </section>
        </>
    )
}
