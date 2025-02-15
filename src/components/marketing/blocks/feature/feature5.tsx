import React from 'react'
import { Badge } from '@/components/ui/badge'

interface FeatureItemProps {
    title: string
    description: string
}

const FeatureItem: React.FC<FeatureItemProps> = ({ title, description }) => (
    <div className="flex flex-col gap-3">
        <div className="bg-muted rounded-lg aspect-video mb-2 overflow-hidden shadow-md">
            {/* Add your image or video content here */}
            {/* Example: <Image src="/path-to-image.jpg" alt={title} layout="fill" objectFit="cover" /> */}
        </div>
        <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
        <p className="text-muted-foreground text-base">{description}</p>
    </div>
)

const featureItems: FeatureItemProps[] = [
    {
        title: 'Pay supplier invoices',
        description: 'Our goal is to streamline SMB trade, making it easier and faster than ever.',
    },
    // Add 5 more items here with unique titles and descriptions
]

export const Feature5: React.FC = () => (
    <section className="w-full py-16 lg:py-24 bg-gradient-to-b from-background to-background/80">
        <div className="container mx-auto px-4">
            <div className="flex flex-col gap-12">
                <div className="text-center">
                    <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Platform</Badge>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
                        Something new!
                    </h2>
                    <p className="text-lg max-w-2xl mx-auto leading-relaxed text-muted-foreground">
                        Managing a small business today is already tough. Our platform is designed to make it easier.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featureItems.map((item, index) => (
                        <FeatureItem key={index} {...item} />
                    ))}
                </div>
            </div>
        </div>
    </section>
)
