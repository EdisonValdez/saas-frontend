import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export function Heor6() {
    return (
        <div className="container px-6 py-16 mx-auto text-center">
            <div className="max-w-lg mx-auto">
                <h1 className="text-3xl font-semibold text-gray-800 dark:text-white lg:text-4xl">Build Your Startup</h1>
                <p className="mt-6 text-gray-500 dark:text-gray-300">
                    Lorem ipsum dolor sit, amet consectetur adipisicing elit. Libero similique obcaecati illum mollitia.
                </p>
                <Button size="lg" className="mt-6" variant="default" asChild>
                    <Link href="/login">Start 14-Day Free Trial</Link>
                </Button>

                <p className="mt-3 text-sm text-gray-400">No credit card required</p>
            </div>

            <div className="flex justify-center mt-10">
                <Image
                    alt="Startup Image"
                    className="object-cover w-full h-96 rounded-xl lg:w-4/5"
                    src="/images/marketing/annie-spratt-QckxruozjRg-unsplash.jpg"
                    width={1200}
                    height={600}
                    priority={true}
                />
            </div>
        </div>
    )
}
