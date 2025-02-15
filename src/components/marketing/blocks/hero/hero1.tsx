import React from 'react'
import { MoveRight, PhoneCall } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Hero1: React.FC = () => (
    <section className="w-full bg-gradient-to-b from-background to-background/80 py-16 lg:py-24">
        <div className="container mx-auto px-4">
            <div className="flex flex-col items-center justify-center gap-8 text-center">
                <Button variant="secondary" size="sm" className="inline-flex items-center gap-2">
                    Read our launch article <MoveRight className="w-4 h-4" />
                </Button>

                <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight max-w-3xl">
                    This is the start of something new
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                    Managing a small business today is already tough. Avoid further complications by ditching outdated,
                    tedious trade methods. Our goal is to streamline SMB trade, making it easier and faster than ever.
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
        </div>
    </section>
)
