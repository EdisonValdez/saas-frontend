'use client'

import Link from 'next/link'
import Image from 'next/image'
import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export function FeatureV11() {
    const [selectedIndex, setSelectedIndex] = useState(0)

    const contents = [
        {
            title: 'Jumpstart your SaaS project',
            description:
                'Start your SaaS journey with the right tools and support. Our platform provides everything you need to launch quickly and efficiently.',
            imageUrl: '/images/marketing/undraw_Experience_design_re_dmqq.png',
            imageAlt: 'Jumpstart your SaaS project illustration',
            imageWidth: 800,
            imageHeight: 600,
        },
        {
            title: 'The Best Customer Support',
            description:
                'We offer top-notch customer support to ensure you never face challenges alone. Our team is here to help you every step of the way.',
            imageUrl: '/images/marketing/undraw_Team_up_re_84ok.png',
            imageAlt: 'Customer support illustration',
            imageWidth: 800,
            imageHeight: 600,
        },
    ]

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowRight') {
                setSelectedIndex((prevIndex) => (prevIndex + 1) % contents.length)
            } else if (event.key === 'ArrowLeft') {
                setSelectedIndex((prevIndex) => (prevIndex - 1 + contents.length) % contents.length)
            }
        }

        window.addEventListener('keydown', handleKeyDown)

        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [contents.length])

    return (
        <div className="container flex flex-col px-6 py-10 mx-auto space-y-8 lg:h-[32rem] lg:py-16 lg:flex-row lg:items-center">
            <div className="flex flex-col items-center w-full lg:flex-row lg:w-1/2">
                <div className="flex justify-center order-2 mt-6 lg:mt-0 lg:space-y-3 lg:flex-col">
                    {contents.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedIndex(index)}
                            className={`w-4 h-4 mx-2 rounded-full lg:mx-0 focus:outline-none ${index === selectedIndex ? 'bg-blue-600' : 'bg-gray-300 hover:bg-blue-500'}`}
                        ></button>
                    ))}
                </div>

                <div className="max-w-lg lg:mx-12 lg:order-2">
                    <h1 className="text-3xl font-semibold tracking-wide text-gray-800 dark:text-white lg:text-4xl">
                        {contents[selectedIndex].title}
                    </h1>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">{contents[selectedIndex].description}</p>
                    <div className="mt-6">
                        <Link href="/register" className={cn(buttonVariants({ variant: 'default' }))}>
                            Create Account
                        </Link>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-center w-full h-96 lg:w-1/2">
                <Image
                    className="object-cover w-full h-full max-w-2xl rounded-md"
                    src={contents[selectedIndex].imageUrl}
                    alt={contents[selectedIndex].imageAlt}
                    width={contents[selectedIndex].imageWidth}
                    height={contents[selectedIndex].imageHeight}
                    priority={true} // prioritize loading this image
                />
            </div>
        </div>
    )
}
