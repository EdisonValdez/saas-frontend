import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUserServer } from '@/lib/session'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LogIn, UserPlus, ArrowRight, Home } from 'lucide-react'

export default async function IndexPage() {
    // Note: Auth temporarily disabled for demo, so this might not redirect
    // but the logic is in place for when auth is re-enabled
    try {
        const user = await getCurrentUserServer()
        if (user) {
            redirect('/dashboard')
        }
    } catch (error) {
        // Auth temporarily disabled for demo - continue to show landing
        console.log('Auth check failed (demo mode):', error)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">
                {/* Logo/Title */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Promptax</h1>
                    <p className="text-gray-600">AI-Powered Tax Workflow Platform</p>
                </div>

                {/* Auth Options Card */}
                <Card className="shadow-lg border-0">
                    <CardHeader className="text-center pb-4">
                        <CardTitle className="text-xl text-gray-800">Get Started</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Sign In Button */}
                        <Link href="/login" className="block">
                            <Button className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700">
                                <LogIn className="w-5 h-5 mr-2" />
                                Sign In
                            </Button>
                        </Link>

                        {/* Sign Up Button */}
                        <Link href="/register" className="block">
                            <Button variant="outline" className="w-full h-12 text-base border-2 hover:bg-gray-50">
                                <UserPlus className="w-5 h-5 mr-2" />
                                Create Account
                            </Button>
                        </Link>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-gray-500">or</span>
                            </div>
                        </div>

                        {/* Learn More Link */}
                        <Link href="/about" className="block">
                            <Button variant="ghost" className="w-full h-12 text-base text-gray-600 hover:text-gray-800">
                                <Home className="w-5 h-5 mr-2" />
                                View Full Landing Page
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="text-center text-sm text-gray-500">
                    <p>© 2024 Promptax. All rights reserved.</p>
                </div>
            </div>
        </div>
    )
}
