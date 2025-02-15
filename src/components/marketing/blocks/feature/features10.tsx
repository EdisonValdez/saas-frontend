import Link from 'next/link'
import {
    KeyRound,
    CoinsIcon,
    MoveRightIcon,
    FingerprintIcon,
    HammerIcon,
    ImagePlusIcon,
    NetworkIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

const features = [
    {
        title: 'Secure Access',
        description:
            'Keep your data safe with state-of-the-art security features that protect your information from unauthorized access.',
        readMoreLink: '#',
        icon: <KeyRound />,
    },
    {
        title: 'Effortless Transactions',
        description: 'Manage your finances effortlessly with our user-friendly interface and advanced features.',
        readMoreLink: '#',
        icon: <CoinsIcon />,
    },
    {
        title: 'Biometric Authentication',
        description:
            'Secure your account with fingerprint recognition, offering an extra layer of protection for your sensitive data.',
        readMoreLink: '#',
        icon: <FingerprintIcon />,
    },
    {
        title: 'Robust Tools',
        description:
            'Utilize powerful tools to streamline your workflow and increase productivity, making your tasks easier and faster.',
        readMoreLink: '#',
        icon: <HammerIcon />,
    },
    {
        title: 'Enhanced Media Management',
        description: 'Easily upload, manage, and share your media with our comprehensive media management features.',
        readMoreLink: '#',
        icon: <ImagePlusIcon />,
    },
    {
        title: 'Seamless Connectivity',
        description:
            'Stay connected with your team and clients through reliable network features that ensure smooth communication.',
        readMoreLink: '#',
        icon: <NetworkIcon />,
    },
]

export const FeatureV10: React.FC = () => {
    return (
        <section className="py-16 lg:py-24 bg-gradient-to-b from-background to-background/80">
            <div className="container px-4 mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
                    Explore Our <span className="text-primary">Awesome Features</span>
                </h2>
                <p className="text-lg text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
                    Discover the powerful features that make our platform stand out. From security to seamless
                    connectivity, we have it all.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="space-y-4 p-6 bg-card rounded-lg shadow-md">
                            <span className="inline-block p-3 text-primary bg-primary/10 rounded-full">
                                {feature.icon}
                            </span>
                            <h3 className="text-xl font-semibold">{feature.title}</h3>
                            <p className="text-muted-foreground">{feature.description}</p>
                            <Link
                                href={feature.readMoreLink}
                                className={cn(buttonVariants({ variant: 'link' }), 'p-0')}
                            >
                                Read More <MoveRightIcon className="w-4 h-4 ml-1" />
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
