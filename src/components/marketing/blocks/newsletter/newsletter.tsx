import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { Button } from '@/components/ui/button'

export function NewsletterForm() {
    return (
        <div className="max-w-lg mx-auto text-center">
            <h2 className="text-3xl font-semibold text-gray-800 dark:text-white lg:text-4xl">
                Stay Updated with Our Latest News
            </h2>

            <p className="mt-4 text-gray-500 dark:text-gray-300">
                Subscribe to our newsletter and never miss out on our latest updates, articles, and resources. Join our
                community today!
            </p>

            <div className="w-full max-w-sm mx-auto mt-6">
                <form className="flex flex-col md:flex-row items-center bg-transparent border rounded-md dark:border-gray-700 focus-within:border-blue-400 focus-within:ring focus-within:ring-blue-300 dark:focus-within:border-blue-300 focus-within:ring-opacity-40">
                    <input
                        type="email"
                        placeholder="Enter your email address"
                        className="flex-1 h-12 px-4 py-2 m-1 text-gray-700 placeholder-gray-400 bg-transparent border-none appearance-none dark:text-gray-200 focus:outline-none focus:placeholder-transparent focus:ring-0"
                    />

                    <Button type="submit" className={cn(buttonVariants({ variant: 'default' }))}>
                        Join Us
                    </Button>
                </form>
            </div>
        </div>
    )
}
