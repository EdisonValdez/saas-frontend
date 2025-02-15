import React from 'react'
import { MoveRight, Mail } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const CTA2: React.FC = () => (
    <section className="w-full py-16 lg:py-24 bg-gradient-to-b from-muted/50 to-muted">
        <div className="container mx-auto px-4">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
                <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">Get started</Badge>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
                    Ready to Plan Your Next Adventure?
                </h2>
                <p className="text-lg mb-8 leading-relaxed text-muted-foreground">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore
                    et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                    aliquip ex ea commodo consequat.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="mailto:support@Acme.com" passHref>
                        <Button variant="outline" className="w-full sm:w-auto">
                            Write to us
                            <Mail className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                    <Link href="/register" passHref>
                        <Button className="w-full sm:w-auto">
                            Sign up here
                            <MoveRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    </section>
)
