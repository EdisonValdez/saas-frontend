import ClientOnboardingWorkflow from '@/components/clients/client-onboarding-workflow'

export default function ClientOnboardingDemo() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Client Onboarding Workflow Demo</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          This demo showcases a comprehensive 5-step client onboarding process designed for tax professionals. 
          The workflow includes data validation, document processing, intelligent field mapping, and progress tracking.
        </p>
      </div>
      
      <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-3 text-blue-900">Demo Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h3 className="font-medium mb-2">Workflow Features:</h3>
            <ul className="space-y-1">
              <li>• Multi-step progress tracking</li>
              <li>• Real-time validation</li>
              <li>• Conditional navigation</li>
              <li>• Save & resume functionality</li>
              <li>• Responsive design</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Data Processing:</h3>
            <ul className="space-y-1">
              <li>• Document upload with drag-and-drop</li>
              <li>• AI-powered data extraction (simulated)</li>
              <li>• Intelligent field mapping</li>
              <li>• Tax-specific validation</li>
              <li>• Data quality scoring</li>
            </ul>
          </div>
        </div>
      </div>

      <ClientOnboardingWorkflow />
    </div>
  )
}
