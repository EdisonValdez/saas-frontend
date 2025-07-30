import FormSelectionDashboard from '@/components/forms/form-selection-dashboard'
import { DemoLayout } from '@/components/layouts/demo-layout'

export default function FormSelectionDemo() {
  return (
    <DemoLayout>
      <div className="container mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Tax Form Selection & Generation Dashboard</h1>
        <p className="text-lg text-gray-600 max-w-4xl mx-auto">
          This comprehensive dashboard demonstrates advanced tax form management capabilities including 
          intelligent search, hierarchical categorization, batch operations, and sophisticated preview functionality 
          with side-by-side data population views.
        </p>
      </div>
      
      <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-3 text-blue-900">Dashboard Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-blue-800">
          <div>
            <h3 className="font-medium mb-2">Form Organization:</h3>
            <ul className="space-y-1">
              <li>• Hierarchical categorization by type & entity</li>
              <li>• Visual completion status indicators</li>
              <li>• Complexity level and time estimates</li>
              <li>• Smart recommendations engine</li>
              <li>• Recently used forms tracking</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Search & Discovery:</h3>
            <ul className="space-y-1">
              <li>• Full-text search across all form data</li>
              <li>• Advanced filtering by multiple criteria</li>
              <li>• Jurisdiction and year-based filtering</li>
              <li>• Status and completion filtering</li>
              <li>• Tag-based organization</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Advanced Operations:</h3>
            <ul className="space-y-1">
              <li>• Multi-select batch operations</li>
              <li>• Bulk export (PDF, e-file formats)</li>
              <li>• Progress tracking for operations</li>
              <li>• Side-by-side template preview</li>
              <li>• Data quality analysis</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-3 text-green-900">Preview System Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-green-800">
          <div>
            <h3 className="font-medium mb-2">Form Preview:</h3>
            <ul className="space-y-1">
              <li>• Side-by-side template and data view</li>
              <li>• Field-by-field data population preview</li>
              <li>• Real-time edit mode with validation</li>
              <li>• Data source identification (client/extracted/calculated)</li>
              <li>• Confidence scoring for extracted data</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Data Quality:</h3>
            <ul className="space-y-1">
              <li>• Completeness and accuracy metrics</li>
              <li>• Missing required field identification</li>
              <li>• Validation error highlighting</li>
              <li>• Automated calculation verification</li>
              <li>• Data quality scoring dashboard</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mb-8 bg-amber-50 border border-amber-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-3 text-amber-900">Try These Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-amber-800">
          <div>
            <h3 className="font-medium mb-2">Search & Filter:</h3>
            <ul className="space-y-1">
              <li>• Search for "1040" or "business" in the search box</li>
              <li>• Filter by complexity level (Simple/Moderate/Complex)</li>
              <li>• Try filtering by entity type (Individual/Business)</li>
              <li>• Use status filters to see forms by completion stage</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Preview & Edit:</h3>
            <ul className="space-y-1">
              <li>• Click "Preview" on any form to see the side-by-side view</li>
              <li>• Toggle "Edit Mode" to modify field values</li>
              <li>• Check the "Calculations" tab for formula details</li>
              <li>• Select multiple forms for batch operations</li>
            </ul>
          </div>
        </div>
      </div>

        <FormSelectionDashboard />
      </div>
    </DemoLayout>
  )
}
