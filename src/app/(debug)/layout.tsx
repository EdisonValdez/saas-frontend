import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Debug Tools',
    description: 'Development and debugging tools',
}

export default function DebugLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-background">
            <header className="border-b">
                <div className="container mx-auto px-4 py-4">
                    <h1 className="text-xl font-semibold text-orange-600">🛠️ Debug Tools</h1>
                    <p className="text-sm text-muted-foreground">Development and testing utilities</p>
                </div>
            </header>
            <main className="container mx-auto px-4 py-6">
                {children}
            </main>
        </div>
    )
}
