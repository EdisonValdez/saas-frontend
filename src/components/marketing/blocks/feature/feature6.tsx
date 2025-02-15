import Image from 'next/image'
import { User, ClipboardList, Compass, Settings, LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface FeatureCardProps {
    title: string
    description: string
    icon: LucideIcon
    image: string
    span?: string
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon: Icon, image, span }) => (
    <div className={`relative rounded-2xl overflow-hidden group ${span || ''}`}>
        <Image
            src={image}
            alt={title}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20 group-hover:from-black/90 transition-colors duration-300" />
        <div className="relative z-10 p-6 h-full flex flex-col justify-between">
            <Icon className="w-10 h-10 text-primary mb-4" />
            <div>
                <h3 className="text-2xl font-semibold text-white mb-2 group-hover:text-primary transition-colors duration-300">
                    {title}
                </h3>
                <p className="text-sm text-gray-300 group-hover:text-white transition-colors duration-300">
                    {description}
                </p>
            </div>
        </div>
    </div>
)

export const Feature6: React.FC = () => (
    <section className="w-full py-16 lg:py-24 bg-gradient-to-b from-background to-background/80">
        <div className="container mx-auto px-4">
            <div className="flex flex-col gap-12">
                <div className="text-center">
                    <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Acme</Badge>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
                        Lorem Ipsum Dolor Sit Amet!
                    </h2>
                    <p className="text-lg max-w-2xl mx-auto leading-relaxed text-muted-foreground">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
                        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
                        laboris nisi ut aliquip ex ea commodo consequat.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    <FeatureCard
                        title="Lorem Ipsum"
                        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                        icon={ClipboardList}
                        image="/images/marketing/julentto-photography-CIuakYIjadc-unsplash.jpg"
                        span="lg:col-span-2"
                    />
                    <FeatureCard
                        title="Dolor Sit Amet"
                        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                        icon={Compass}
                        image="/images/marketing/pexels-andreimike-1271619.jpg"
                    />
                    <FeatureCard
                        title="Consectetur Adipiscing"
                        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                        icon={Settings}
                        image="/images/marketing/pexels-nastyasensei-66707-335393.jpg"
                    />
                    <FeatureCard
                        title="Eiusmod Tempor"
                        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                        icon={User}
                        image="/images/marketing/shifaaz-shamoon-qtbV_8P_Ksk-unsplash.jpg"
                        span="lg:col-span-2"
                    />
                </div>
            </div>
        </div>
    </section>
)
