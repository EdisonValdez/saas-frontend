import React from 'react'
import { MoveRight, PhoneCall } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export const Hero3: React.FC = () => (
    <section className="w-full bg-gradient-to-b from-background to-background/80 py-16 lg:py-24">
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="flex flex-col gap-6">
                    <Badge variant="outline" className="w-fit px-3 py-1 text-sm font-medium">
                        We&apos;re live!
                    </Badge>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                        This is the start of something!
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
                        Managing a small business today is already tough. Avoid further complications by ditching
                        outdated, tedious trade methods. Our goal is to streamline SMB trade, making it easier and
                        faster than ever.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 mt-4">
                        <Button size="lg" variant="outline" className="inline-flex items-center gap-2">
                            Jump on a call <PhoneCall className="w-4 h-4" />
                        </Button>
                        <Button size="lg" className="inline-flex items-center gap-2">
                            Sign up here <MoveRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div className="bg-muted rounded-lg aspect-square shadow-md"></div>
            </div>
        </div>
    </section>
)
