import { Metadata } from 'next'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Terms of Service',
    description: 'Terms of Service for Promptax',
}

export default function TermsPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-8">
                <Link
                    href="/"
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                </Link>
                <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
                <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>1. Acceptance of Terms</CardTitle>
                    </CardHeader>
                    <CardContent className="prose max-w-none">
                        <p>
                            By accessing and using Promptax ("Service"), you accept and agree to be bound by the terms
                            and provision of this agreement. If you do not agree to abide by the above, please do not
                            use this service.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>2. Description of Service</CardTitle>
                    </CardHeader>
                    <CardContent className="prose max-w-none">
                        <p>
                            Promptax is an AI-powered tax workflow assistant that helps transform complex tax documents
                            into completed forms. Our service provides automated document processing, form generation,
                            and workflow management capabilities.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>3. User Account</CardTitle>
                    </CardHeader>
                    <CardContent className="prose max-w-none">
                        <p>
                            To access certain features of the Service, you must register for an account. You agree to:
                        </p>
                        <ul className="list-disc pl-6 mt-2">
                            <li>Provide accurate, current and complete information during registration</li>
                            <li>Maintain and promptly update your account information</li>
                            <li>
                                Maintain the security of your password and accept responsibility for all activities
                                under your account
                            </li>
                            <li>Notify us immediately of any unauthorized use of your account</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>4. Subscription and Payment</CardTitle>
                    </CardHeader>
                    <CardContent className="prose max-w-none">
                        <p>Our Service offers various subscription plans. By subscribing, you agree to:</p>
                        <ul className="list-disc pl-6 mt-2">
                            <li>Pay all fees associated with your selected plan</li>
                            <li>Provide accurate billing information</li>
                            <li>Authorize automatic renewal unless cancelled</li>
                            <li>Accept that fees are non-refundable except as required by law</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>5. Data and Privacy</CardTitle>
                    </CardHeader>
                    <CardContent className="prose max-w-none">
                        <p>
                            Your privacy is important to us. Please review our Privacy Policy, which also governs your
                            use of the Service, to understand our practices. You retain ownership of your data, and we
                            use it only as necessary to provide our services.
                        </p>
                        <Link href="/privacy" className="text-primary hover:underline">
                            View our Privacy Policy
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>6. Acceptable Use</CardTitle>
                    </CardHeader>
                    <CardContent className="prose max-w-none">
                        <p>You agree not to use the Service to:</p>
                        <ul className="list-disc pl-6 mt-2">
                            <li>Upload malicious code or conduct security testing without permission</li>
                            <li>Attempt to gain unauthorized access to any part of the Service</li>
                            <li>Use the Service for any illegal purpose or in violation of any laws</li>
                            <li>Interfere with or disrupt the Service or servers</li>
                            <li>Upload content that violates intellectual property rights</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>7. Limitation of Liability</CardTitle>
                    </CardHeader>
                    <CardContent className="prose max-w-none">
                        <p>
                            The Service is provided "as is" without warranties of any kind. We shall not be liable for
                            any indirect, incidental, special, consequential, or punitive damages, including without
                            limitation, loss of profits, data, use, goodwill, or other intangible losses.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>8. Termination</CardTitle>
                    </CardHeader>
                    <CardContent className="prose max-w-none">
                        <p>
                            We may terminate or suspend your account immediately, without prior notice or liability, for
                            any reason whatsoever, including without limitation if you breach the Terms. Upon
                            termination, your right to use the Service will cease immediately.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>9. Changes to Terms</CardTitle>
                    </CardHeader>
                    <CardContent className="prose max-w-none">
                        <p>
                            We reserve the right to modify these terms at any time. We will notify users of any material
                            changes. Your continued use of the Service after such modifications will constitute
                            acknowledgment and agreement of the modified terms.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>10. Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="prose max-w-none">
                        <p>If you have any questions about these Terms of Service, please contact us at:</p>
                        <p className="mt-2">
                            Email: support@promptax.com
                            <br />
                            Website: promptax.com
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-12 text-center">
                <Link href="/">
                    <Button variant="outline">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Return to Home
                    </Button>
                </Link>
            </div>
        </div>
    )
}
