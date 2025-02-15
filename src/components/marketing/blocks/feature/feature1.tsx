import Image from 'next/image'
import { Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface FeatureItemProps {
    title: string
    description: string
}

const FeatureItem = ({ title, description }: FeatureItemProps) => (
    <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 mt-1">
            <Check className="w-5 h-5 text-primary" />
        </div>
        <div>
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-muted-foreground mt-1">{description}</p>
        </div>
    </div>
)

export const Feature1 = () => (
    <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
            <div className="bg-card border rounded-xl shadow-lg overflow-hidden">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    <div className="p-8 lg:p-12">
                        <Badge variant="outline" className="mb-4">
                            Acme
                        </Badge>
                        <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight mb-4">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        </h2>
                        <p className="text-lg text-muted-foreground mb-8">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
                            labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
                            laboris nisi ut aliquip ex ea commodo consequat.
                        </p>
                        <div className="space-y-6">
                            <FeatureItem
                                title="Lorem ipsum dolor sit amet"
                                description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                            />
                            <FeatureItem
                                title="Ut enim ad minim veniam"
                                description="Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
                            />
                            <FeatureItem
                                title="Duis aute irure dolor in reprehenderit"
                                description="Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
                            />
                        </div>
                    </div>
                    <div className="relative aspect-square lg:aspect-auto lg:h-full">
                        <Image
                            src="/images/marketing/oxana-v-qoAIlAmLJBU-unsplash.jpg"
                            alt=""
                            layout="fill"
                            objectFit="cover"
                            className="rounded-b-xl lg:rounded-r-xl lg:rounded-bl-none"
                        />
                    </div>
                </div>
            </div>
        </div>
    </section>
)
