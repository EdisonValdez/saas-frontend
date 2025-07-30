import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUserServer } from '@/lib/session'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
    ArrowRight, 
    CheckCircle, 
    FileText, 
    Calculator, 
    Users, 
    Shield,
    Zap,
    BarChart3,
    MessageSquare,
    Clock
} from 'lucide-react'

export default async function IndexPage() {
    const user = await getCurrentUserServer()
    
    // If user is logged in, redirect to dashboard
    if (user) {
        redirect('/dashboard')
    }

    // If not logged in, show the landing page
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
                        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse" />
                        <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000" />
                        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000" />
                    </div>
                </div>
                
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
                    <div className="text-center space-y-8">
                        {/* Badge */}
                        <div className="flex justify-center">
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-sm px-4 py-2">
                                <Zap className="w-4 h-4 mr-2" />
                                AI-Powered Tax Workflow System
                            </Badge>
                        </div>

                        {/* Main Heading */}
                        <div className="space-y-4">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
                                Streamline Your
                                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                    Tax Workflow
                                </span>
                            </h1>
                            <p className="max-w-3xl mx-auto text-xl text-gray-600 leading-relaxed">
                                Transform your tax practice with our comprehensive AI-powered platform. 
                                Automate document processing, intelligent form generation, and client management 
                                with enterprise-grade security and compliance.
                            </p>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/login">
                                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200">
                                    Sign In
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button size="lg" variant="outline" className="border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 px-8 py-3 text-lg transition-all duration-200">
                                    Create Account
                                </Button>
                            </Link>
                        </div>

                        {/* Trust Indicators */}
                        <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-gray-500">
                            <div className="flex items-center space-x-2">
                                <Shield className="w-4 h-4 text-green-500" />
                                <span>Enterprise Security</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span>IRS Compliant</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-green-500" />
                                <span>24/7 Support</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                            Everything You Need to Scale Your Practice
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Our platform combines cutting-edge AI with intuitive design to help tax professionals 
                            work more efficiently and serve clients better.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                            <CardContent className="p-8">
                                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-6 group-hover:bg-blue-200 transition-colors">
                                    <FileText className="w-8 h-8 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                    Intelligent Form Generation
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    AI-powered tax form generation with intelligent field mapping, 
                                    real-time validation, and comprehensive error checking.
                                </p>
                                <ul className="space-y-2">
                                    <li className="flex items-center text-sm text-gray-600">
                                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                                        Auto-populate from client data
                                    </li>
                                    <li className="flex items-center text-sm text-gray-600">
                                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                                        Real-time calculation validation
                                    </li>
                                    <li className="flex items-center text-sm text-gray-600">
                                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                                        E-file ready formats
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Feature 2 */}
                        <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                            <CardContent className="p-8">
                                <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-6 group-hover:bg-green-200 transition-colors">
                                    <MessageSquare className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                    AI Tax Assistant
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Advanced conversational AI that helps with tax questions, 
                                    document analysis, and calculation verification.
                                </p>
                                <ul className="space-y-2">
                                    <li className="flex items-center text-sm text-gray-600">
                                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                                        Natural language processing
                                    </li>
                                    <li className="flex items-center text-sm text-gray-600">
                                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                                        Document OCR and analysis
                                    </li>
                                    <li className="flex items-center text-sm text-gray-600">
                                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                                        PII detection and security
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Feature 3 */}
                        <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                            <CardContent className="p-8">
                                <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-2xl mb-6 group-hover:bg-purple-200 transition-colors">
                                    <Users className="w-8 h-8 text-purple-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                    Client Management
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Comprehensive client lifecycle management with document tracking, 
                                    communication history, and automated workflows.
                                </p>
                                <ul className="space-y-2">
                                    <li className="flex items-center text-sm text-gray-600">
                                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                                        Centralized client profiles
                                    </li>
                                    <li className="flex items-center text-sm text-gray-600">
                                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                                        Document version control
                                    </li>
                                    <li className="flex items-center text-sm text-gray-600">
                                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                                        Automated status updates
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">98%</div>
                            <div className="text-gray-600">Accuracy Rate</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl lg:text-4xl font-bold text-green-600 mb-2">75%</div>
                            <div className="text-gray-600">Time Saved</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl lg:text-4xl font-bold text-purple-600 mb-2">50+</div>
                            <div className="text-gray-600">Form Types</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl lg:text-4xl font-bold text-indigo-600 mb-2">24/7</div>
                            <div className="text-gray-600">AI Support</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-24 bg-gradient-to-r from-blue-600 to-indigo-600">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                        Ready to Transform Your Tax Practice?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                        Join thousands of tax professionals who are already using our platform 
                        to streamline their workflow and grow their practice.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/register">
                            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200">
                                Start Free Trial
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg transition-all duration-200">
                                Sign In
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="text-2xl font-bold mb-4">TaxFlow Pro</div>
                        <p className="text-gray-400 mb-6">
                            Professional tax workflow management platform
                        </p>
                        <div className="flex justify-center space-x-8 text-sm text-gray-400">
                            <Link href="/about" className="hover:text-white transition-colors">About</Link>
                            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
                            <span>© 2024 TaxFlow Pro. All rights reserved.</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
