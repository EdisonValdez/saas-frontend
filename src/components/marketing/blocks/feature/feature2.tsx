import React from 'react'
import { Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface StepProps {
    title: string
    description: string
}

const Step: React.FC<StepProps> = ({ title, description }) => (
    <div className="flex flex-row gap-4 items-start">
        <div className="flex-shrink-0 mt-1">
            <div className="rounded-full bg-primary/10 p-1">
                <Check className="w-4 h-4 text-primary" />
            </div>
        </div>
        <div className="flex flex-col gap-1">
            <h3 className="font-medium text-lg">{title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        </div>
    </div>
)

const steps: StepProps[] = [
    {
        title: 'Tell Us About Your Trip',
        description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
    {
        title: 'Let AI Work Its Magic',
        description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
    {
        title: 'Collaborate and Customize',
        description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
    {
        title: 'Book and Go',
        description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
    {
        title: 'Leverage AI',
        description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
    {
        title: 'Generate Your Final Itinerary',
        description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
]

export const Feature2: React.FC = () => (
    <section className="w-full py-16 lg:py-24 bg-gradient-to-b from-background to-background/80">
        <div className="container mx-auto px-4">
            <div className="flex flex-col gap-8">
                <div className="text-center">
                    <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Acme</Badge>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
                        How It Works?
                    </h2>
                    <p className="text-lg max-w-2xl mx-auto leading-relaxed text-muted-foreground">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
                        labore et dolore magna aliqua.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {steps.map((step, index) => (
                        <Step key={index} {...step} />
                    ))}
                </div>
            </div>
        </div>
    </section>
)
