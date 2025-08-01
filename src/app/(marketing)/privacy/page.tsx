import { Metadata } from 'next'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Privacy Policy',
    description: 'Privacy Policy for Promptax',
}

export default function PrivacyPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-8">
                <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                </Link>
                <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
                <p className="text-muted-foreground">
                    Last updated: {new Date().toLocaleDateString()}
                </p>
            </div>

            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>1. Information We Collect</CardTitle>
                    </CardHeader>
                    <CardContent className="prose max-w-none">
                        <p>
                            We collect information you provide directly to us, such as when you create an account, 
                            upload documents, or contact us for support.
                        </p>
                        <h4 className="font-semibold mt-4">Personal Information:</h4>
                        <ul className="list-disc pl-6 mt-2">
                            <li>Name and email address</li>
                            <li>Account credentials</li>
                            <li>Billing and payment information</li>
                            <li>Communication preferences</li>
                        </ul>
                        <h4 className="font-semibold mt-4">Usage Information:</h4>
                        <ul className="list-disc pl-6 mt-2">
                            <li>Documents and files you upload</li>
                            <li>Service usage patterns</li>
                            <li>Device and browser information</li>
                            <li>IP address and location data</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>2. How We Use Your Information</CardTitle>
                    </CardHeader>
                    <CardContent className="prose max-w-none">
                        <p>
                            We use the information we collect to:
                        </p>
                        <ul className="list-disc pl-6 mt-2">
                            <li>Provide, maintain, and improve our services</li>
                            <li>Process your documents and generate tax forms</li>
                            <li>Handle billing and account management</li>
                            <li>Send you technical notices and support messages</li>
                            <li>Respond to your comments and questions</li>
                            <li>Analyze usage patterns to improve our service</li>
                            <li>Detect and prevent fraud and abuse</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>3. Information Sharing</CardTitle>
                    </CardHeader>
                    <CardContent className="prose max-w-none">
                        <p>
                            We do not sell, trade, or rent your personal information to third parties. We may share 
                            your information only in the following circumstances:
                        </p>
                        <ul className="list-disc pl-6 mt-2">
                            <li><strong>Service Providers:</strong> With trusted third parties who assist in operating our service</li>
                            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                            <li><strong>With Consent:</strong> When you give us explicit permission</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>4. Data Security</CardTitle>
                    </CardHeader>
                    <CardContent className="prose max-w-none">
                        <p>
                            We implement appropriate technical and organizational measures to protect your personal 
                            information against unauthorized access, alteration, disclosure, or destruction:
                        </p>
                        <ul className="list-disc pl-6 mt-2">
                            <li>Encryption in transit and at rest</li>
                            <li>Regular security assessments</li>
                            <li>Access controls and authentication</li>
                            <li>Secure cloud infrastructure</li>
                            <li>Employee training on data protection</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>5. Data Retention</CardTitle>
                    </CardHeader>
                    <CardContent className="prose max-w-none">
                        <p>
                            We retain your personal information for as long as necessary to provide our services and 
                            fulfill the purposes outlined in this privacy policy. We will delete or anonymize your 
                            information when:
                        </p>
                        <ul className="list-disc pl-6 mt-2">
                            <li>You request deletion of your account</li>
                            <li>Your account has been inactive for an extended period</li>
                            <li>We no longer need the information for business purposes</li>
                            <li>Legal retention periods expire</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>6. Your Rights</CardTitle>
                    </CardHeader>
                    <CardContent className="prose max-w-none">
                        <p>
                            Depending on your location, you may have certain rights regarding your personal information:
                        </p>
                        <ul className="list-disc pl-6 mt-2">
                            <li><strong>Access:</strong> Request a copy of your personal information</li>
                            <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                            <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                            <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
                            <li><strong>Objection:</strong> Object to certain types of processing</li>
                        </ul>
                        <p className="mt-4">
                            To exercise these rights, please contact us at privacy@promptax.com.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>7. Cookies and Tracking</CardTitle>
                    </CardHeader>
                    <CardContent className="prose max-w-none">
                        <p>
                            We use cookies and similar technologies to:
                        </p>
                        <ul className="list-disc pl-6 mt-2">
                            <li>Keep you logged in</li>
                            <li>Remember your preferences</li>
                            <li>Analyze how you use our service</li>
                            <li>Improve our service performance</li>
                        </ul>
                        <p className="mt-4">
                            You can control cookie settings through your browser preferences.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>8. Third-Party Services</CardTitle>
                    </CardHeader>
                    <CardContent className="prose max-w-none">
                        <p>
                            Our service integrates with third-party services that have their own privacy policies:
                        </p>
                        <ul className="list-disc pl-6 mt-2">
                            <li><strong>Stripe:</strong> For payment processing</li>
                            <li><strong>Cloud Storage:</strong> For secure document storage</li>
                            <li><strong>Analytics:</strong> For service improvement</li>
                        </ul>
                        <p className="mt-4">
                            We encourage you to review the privacy policies of these third parties.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>9. Children's Privacy</CardTitle>
                    </CardHeader>
                    <CardContent className="prose max-w-none">
                        <p>
                            Our service is not intended for children under 13 years of age. We do not knowingly 
                            collect personal information from children under 13. If you are a parent or guardian 
                            and believe your child has provided us with personal information, please contact us.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>10. Changes to Privacy Policy</CardTitle>
                    </CardHeader>
                    <CardContent className="prose max-w-none">
                        <p>
                            We may update this privacy policy from time to time. We will notify you of any material 
                            changes by posting the new privacy policy on this page and updating the "Last updated" date.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>11. Contact Us</CardTitle>
                    </CardHeader>
                    <CardContent className="prose max-w-none">
                        <p>
                            If you have any questions about this Privacy Policy, please contact us:
                        </p>
                        <p className="mt-2">
                            Email: privacy@promptax.com<br />
                            Support: support@promptax.com<br />
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
