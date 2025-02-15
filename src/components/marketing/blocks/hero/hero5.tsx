'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, MoveRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Hero5 = () => {
    const [titleNumber, setTitleNumber] = useState(0)
    const titles = useMemo(() => ['discover', 'plan', 'share'], [])

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setTitleNumber((prev) => (prev === titles.length - 1 ? 0 : prev + 1))
        }, 2000)
        return () => clearTimeout(timeoutId)
    }, [titleNumber, titles])

    return (
        <div className="w-full bg-gradient-to-b from-background to-background/80 py-20 lg:py-32">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center justify-center gap-10 text-center">
                    <Button
                        variant="secondary"
                        size="sm"
                        className="rounded-full font-semibold uppercase tracking-wide"
                    >
                        Lorem ipsum dolor sit amet
                    </Button>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl">
                        <span className="text-primary">Acme helps you</span>
                        <span className="relative block h-20 overflow-hidden mt-2 items-center justify-center">
                            {titles.map((title, index) => (
                                <motion.div
                                    key={index}
                                    // @ts-expect-error - framer-motion types are incorrect
                                    className="absolute w-full"
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{
                                        opacity: titleNumber === index ? 1 : 0,
                                        y: titleNumber === index ? 0 : 50,
                                    }}
                                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                                >
                                    {title}
                                </motion.div>
                            ))}
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
                        labore et dolore magna aliqua.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 mt-6">
                        <Button size="lg" variant="outline" asChild>
                            <a href="mailto:support@Acme.com" className="gap-2">
                                <Mail className="w-5 h-5" />
                                Write to us
                            </a>
                        </Button>
                        <Button size="lg" asChild>
                            <a href="/register" className="gap-2">
                                Sign up here
                                <MoveRight className="w-5 h-5" />
                            </a>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
