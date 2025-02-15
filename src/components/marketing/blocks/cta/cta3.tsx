import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FingerprintIcon, NotebookPenIcon } from 'lucide-react'

export function CTA3() {
    return (
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center space-y-4 text-center">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                            Get Started with Our Platform
                        </h2>
                        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            Join thousands of satisfied customers who are using our platform to build and grow their
                            businesses. Sign up today and take the first step towards success.
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 min-[400px]:flex-row">
                        <Button asChild variant="default">
                            <Link href="/login">
                                <FingerprintIcon className="mr-2 h-4 w-4" />
                                Login with Email
                            </Link>
                        </Button>
                        <Button asChild variant="secondary">
                            <Link href="/contact">
                                <NotebookPenIcon className="mr-2 h-4 w-4" />
                                Write to us
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}
