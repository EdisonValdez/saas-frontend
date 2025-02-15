import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'

export const Feature8: React.FC = () => (
    <section className="w-full py-16 lg:py-24 bg-gradient-to-b from-background to-background/80">
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="flex flex-col gap-6">
                    <Badge className="w-fit bg-primary/10 text-primary border-primary/20">Platform</Badge>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
                        This is the start of something new
                    </h2>
                    <p className="text-lg leading-relaxed text-muted-foreground">
                        Managing a small business today is already tough. Avoid further complications by ditching
                        outdated, tedious trade methods. Our goal is to streamline SMB trade, making it easier and
                        faster than ever.
                    </p>
                </div>
                <div className="w-full">
                    <Carousel className="w-full max-w-xl mx-auto">
                        <CarouselContent>
                            {Array.from({ length: 5 }).map((_, index) => (
                                <CarouselItem key={index}>
                                    <div className="flex rounded-lg aspect-video bg-muted items-center justify-center p-6 shadow-md">
                                        <span className="text-lg font-medium">Platform Screenshot {index + 1}</span>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-0" />
                        <CarouselNext className="right-0" />
                    </Carousel>
                </div>
            </div>
        </div>
    </section>
)
