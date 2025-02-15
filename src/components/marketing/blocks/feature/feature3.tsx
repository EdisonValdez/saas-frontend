import React from 'react'
import { Badge } from '@/components/ui/badge'

export const Feature3: React.FC = () => (
    <section className="w-full py-16 lg:py-24 bg-gradient-to-b from-background to-background/80">
        <div className="container mx-auto px-4">
            <div className="flex flex-col-reverse lg:flex-row gap-12 lg:items-center">
                <div className="flex-1">
                    <div className="bg-muted rounded-lg w-full aspect-video shadow-lg overflow-hidden">
                        {/* Add your image or video content here */}
                        {/* Example: <Image src="/path-to-image.jpg" alt="Feature image" layout="fill" objectFit="cover" /> */}
                    </div>
                </div>
                <div className="flex flex-col gap-6 lg:pl-12 flex-1">
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
            </div>
        </div>
    </section>
)
