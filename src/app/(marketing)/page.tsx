import { Hero5 } from '@/components/marketing/blocks/hero/hero5'
import { CTA2 } from '@/components/marketing/blocks/cta/cta2'
import { Feature1 } from '@/components/marketing/blocks/feature/feature1'
import { Feature6 } from '@/components/marketing/blocks/feature/feature6'
import { Feature2 } from '@/components/marketing/blocks/feature/feature2'

export default async function IndexPage() {
    return (
        <>
            <Hero5 />
            <Feature1 />
            <Feature6 />
            <Feature2 />
            <CTA2 />
        </>
    )
}
