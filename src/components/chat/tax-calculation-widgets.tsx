'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { 
  Calculator, DollarSign, Percent, TrendingUp, TrendingDown, 
  Info, AlertTriangle, CheckCircle, RefreshCw, Download,
  PieChart, BarChart3, Zap
} from 'lucide-react'

interface TaxCalculationWidgetProps {
  type: 'income_tax' | 'deduction' | 'credit' | 'estimated_payment' | 'refund'
  initialData?: Record<string, any>
  onCalculationComplete?: (result: any) => void
  isEmbedded?: boolean
}

interface TaxBracket {
  min: number
  max: number
  rate: number
}

const TAX_BRACKETS_2024 = {
  single: [
    { min: 0, max: 11600, rate: 0.10 },
    { min: 11600, max: 47150, rate: 0.12 },
    { min: 47150, max: 100525, rate: 0.22 },
    { min: 100525, max: 191950, rate: 0.24 },
    { min: 191950, max: 243725, rate: 0.32 },
    { min: 243725, max: 609350, rate: 0.35 },
    { min: 609350, max: Infinity, rate: 0.37 }
  ],
  marriedFilingJointly: [
    { min: 0, max: 23200, rate: 0.10 },
    { min: 23200, max: 94300, rate: 0.12 },
    { min: 94300, max: 201050, rate: 0.22 },
    { min: 201050, max: 383900, rate: 0.24 },
    { min: 383900, max: 487450, rate: 0.32 },
    { min: 487450, max: 731200, rate: 0.35 },
    { min: 731200, max: Infinity, rate: 0.37 }
  ]
}

const STANDARD_DEDUCTIONS_2024 = {
  single: 14600,
  marriedFilingJointly: 29200,
  marriedFilingSeparately: 14600,
  headOfHousehold: 21900
}

export default function TaxCalculationWidget({ 
  type, 
  initialData = {}, 
  onCalculationComplete,
  isEmbedded = false 
}: TaxCalculationWidgetProps) {
  const [inputs, setInputs] = useState({
    income: initialData.income || 0,
    filingStatus: initialData.filingStatus || 'single',
    deductions: initialData.deductions || 0,
    credits: initialData.credits || 0,
    withheld: initialData.withheld || 0,
    estimatedPayments: initialData.estimatedPayments || 0,
    dependents: initialData.dependents || 0,
    age: initialData.age || 35,
    ...initialData
  })

  const [results, setResults] = useState<any>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [breakdown, setBreakdown] = useState<any[]>([])

  useEffect(() => {
    if (Object.values(inputs).some(val => val > 0)) {
      calculateTax()
    }
  }, [inputs])

  const calculateTax = async () => {
    setIsCalculating(true)
    
    // Simulate calculation delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const taxableIncome = Math.max(0, inputs.income - getStandardDeduction(inputs.filingStatus) - inputs.deductions)
    const brackets = TAX_BRACKETS_2024[inputs.filingStatus as keyof typeof TAX_BRACKETS_2024] || TAX_BRACKETS_2024.single
    
    let federalTax = 0
    let currentIncome = taxableIncome
    const taxBreakdown: any[] = []

    // Calculate tax using brackets
    for (const bracket of brackets) {
      if (currentIncome <= 0) break
      
      const taxableAtBracket = Math.min(currentIncome, bracket.max - bracket.min)
      const taxAtBracket = taxableAtBracket * bracket.rate
      
      if (taxableAtBracket > 0) {
        taxBreakdown.push({
          bracket: `${bracket.rate * 100}%`,
          income: taxableAtBracket,
          tax: taxAtBracket,
          range: `$${bracket.min.toLocaleString()} - ${bracket.max === Infinity ? '∞' : `$${bracket.max.toLocaleString()}`}`
        })
        
        federalTax += taxAtBracket
        currentIncome -= taxableAtBracket
      }
    }

    // Apply credits
    const taxAfterCredits = Math.max(0, federalTax - inputs.credits)
    
    // Calculate refund or amount owed
    const totalPayments = inputs.withheld + inputs.estimatedPayments
    const refundOrOwed = totalPayments - taxAfterCredits

    const calculationResults = {
      grossIncome: inputs.income,
      standardDeduction: getStandardDeduction(inputs.filingStatus),
      itemizedDeductions: inputs.deductions,
      taxableIncome,
      federalTax,
      credits: inputs.credits,
      taxAfterCredits,
      totalPayments,
      refundOrOwed,
      effectiveRate: inputs.income > 0 ? (taxAfterCredits / inputs.income) * 100 : 0,
      marginalRate: getCurrentMarginalRate(taxableIncome, inputs.filingStatus) * 100,
      breakdown: taxBreakdown
    }

    setResults(calculationResults)
    setBreakdown(taxBreakdown)
    setIsCalculating(false)

    if (onCalculationComplete) {
      onCalculationComplete(calculationResults)
    }
  }

  const getStandardDeduction = (filingStatus: string): number => {
    return STANDARD_DEDUCTIONS_2024[filingStatus as keyof typeof STANDARD_DEDUCTIONS_2024] || STANDARD_DEDUCTIONS_2024.single
  }

  const getCurrentMarginalRate = (taxableIncome: number, filingStatus: string): number => {
    const brackets = TAX_BRACKETS_2024[filingStatus as keyof typeof TAX_BRACKETS_2024] || TAX_BRACKETS_2024.single
    
    for (const bracket of brackets) {
      if (taxableIncome >= bracket.min && taxableIncome < bracket.max) {
        return bracket.rate
      }
    }
    return brackets[brackets.length - 1].rate
  }

  const updateInput = (field: string, value: any) => {
    setInputs(prev => ({ ...prev, [field]: value }))
  }

  const renderIncomeTaxCalculator = () => (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="income">Annual Income</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="income"
              type="number"
              value={inputs.income}
              onChange={(e) => updateInput('income', parseFloat(e.target.value) || 0)}
              className="pl-10"
              placeholder="0"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="filingStatus">Filing Status</Label>
          <Select value={inputs.filingStatus} onValueChange={(value) => updateInput('filingStatus', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="marriedFilingJointly">Married Filing Jointly</SelectItem>
              <SelectItem value="marriedFilingSeparately">Married Filing Separately</SelectItem>
              <SelectItem value="headOfHousehold">Head of Household</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="deductions">Itemized Deductions</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="deductions"
              type="number"
              value={inputs.deductions}
              onChange={(e) => updateInput('deductions', parseFloat(e.target.value) || 0)}
              className="pl-10"
              placeholder="0"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="credits">Tax Credits</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="credits"
              type="number"
              value={inputs.credits}
              onChange={(e) => updateInput('credits', parseFloat(e.target.value) || 0)}
              className="pl-10"
              placeholder="0"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="withheld">Tax Withheld</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="withheld"
              type="number"
              value={inputs.withheld}
              onChange={(e) => updateInput('withheld', parseFloat(e.target.value) || 0)}
              className="pl-10"
              placeholder="0"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimatedPayments">Estimated Payments</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="estimatedPayments"
              type="number"
              value={inputs.estimatedPayments}
              onChange={(e) => updateInput('estimatedPayments', parseFloat(e.target.value) || 0)}
              className="pl-10"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Results Section */}
      {results && (
        <div className="space-y-4">
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tax Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Calculator className="w-5 h-5" />
                  <span>Tax Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Gross Income:</span>
                  <span className="font-medium">${results.grossIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Standard Deduction:</span>
                  <span className="font-medium">${results.standardDeduction.toLocaleString()}</span>
                </div>
                {results.itemizedDeductions > 0 && (
                  <div className="flex justify-between">
                    <span>Itemized Deductions:</span>
                    <span className="font-medium">${results.itemizedDeductions.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2">
                  <span>Taxable Income:</span>
                  <span className="font-bold">${results.taxableIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Federal Tax:</span>
                  <span className="font-medium">${results.federalTax.toLocaleString()}</span>
                </div>
                {results.credits > 0 && (
                  <div className="flex justify-between">
                    <span>Less Credits:</span>
                    <span className="font-medium text-green-600">-${results.credits.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2">
                  <span>Tax After Credits:</span>
                  <span className="font-bold">${results.taxAfterCredits.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Tax Rates */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Percent className="w-5 h-5" />
                  <span>Tax Rates</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Effective Rate:</span>
                    <Badge variant="secondary">
                      {results.effectiveRate.toFixed(2)}%
                    </Badge>
                  </div>
                  <Progress value={results.effectiveRate} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Marginal Rate:</span>
                    <Badge variant="outline">
                      {results.marginalRate.toFixed(2)}%
                    </Badge>
                  </div>
                  <Progress value={results.marginalRate} className="h-2" />
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p><strong>Effective Rate:</strong> Your overall tax rate</p>
                      <p><strong>Marginal Rate:</strong> Tax rate on your next dollar of income</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Refund/Owed */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  {results.refundOrOwed >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-500" />
                  )}
                  <span>Refund/Owed</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Tax After Credits:</span>
                  <span className="font-medium">${results.taxAfterCredits.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Payments:</span>
                  <span className="font-medium">${results.totalPayments.toLocaleString()}</span>
                </div>
                <Separator />
                <div className={`text-center p-4 rounded-lg ${
                  results.refundOrOwed >= 0 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className={`text-2xl font-bold ${
                    results.refundOrOwed >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ${Math.abs(results.refundOrOwed).toLocaleString()}
                  </div>
                  <div className={`text-sm ${
                    results.refundOrOwed >= 0 ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {results.refundOrOwed >= 0 ? 'Expected Refund' : 'Amount Owed'}
                  </div>
                </div>

                {results.refundOrOwed < 0 && (
                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                    <AlertTriangle className="w-3 h-3 inline mr-1" />
                    Consider making estimated payments to avoid penalties
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tax Bracket Breakdown */}
          {breakdown.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Tax Bracket Breakdown</span>
                </CardTitle>
                <CardDescription>
                  How your tax is calculated across different brackets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {breakdown.map((bracket, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">{bracket.bracket}</Badge>
                        <div className="text-sm text-gray-600">{bracket.range}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${bracket.tax.toFixed(2)}</div>
                        <div className="text-sm text-gray-600">on ${bracket.income.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )

  const renderDeductionCalculator = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-medium">Deduction Calculator</h3>
        <p className="text-sm text-gray-600">Compare standard vs. itemized deductions</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Standard Deduction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${getStandardDeduction(inputs.filingStatus).toLocaleString()}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Automatic deduction for {inputs.filingStatus.replace(/([A-Z])/g, ' $1').toLowerCase()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Itemized Deductions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Input
                placeholder="Medical expenses"
                type="number"
                onChange={(e) => updateInput('medical', parseFloat(e.target.value) || 0)}
              />
              <Input
                placeholder="State and local taxes"
                type="number"
                onChange={(e) => updateInput('salt', parseFloat(e.target.value) || 0)}
              />
              <Input
                placeholder="Mortgage interest"
                type="number"
                onChange={(e) => updateInput('mortgage', parseFloat(e.target.value) || 0)}
              />
              <Input
                placeholder="Charitable contributions"
                type="number"
                onChange={(e) => updateInput('charity', parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <div className="text-2xl font-bold">
                ${((inputs.medical || 0) + (inputs.salt || 0) + (inputs.mortgage || 0) + (inputs.charity || 0)).toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">Total itemized deductions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <CheckCircle className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-blue-900">Recommendation</span>
        </div>
        <p className="text-blue-800">
          {getStandardDeduction(inputs.filingStatus) > 
           ((inputs.medical || 0) + (inputs.salt || 0) + (inputs.mortgage || 0) + (inputs.charity || 0))
            ? `Take the standard deduction of $${getStandardDeduction(inputs.filingStatus).toLocaleString()}`
            : `Itemize your deductions for greater savings`
          }
        </p>
      </div>
    </div>
  )

  const content = () => {
    switch (type) {
      case 'income_tax':
        return renderIncomeTaxCalculator()
      case 'deduction':
        return renderDeductionCalculator()
      case 'credit':
        return <div>Tax Credit Calculator (Coming Soon)</div>
      case 'estimated_payment':
        return <div>Estimated Payment Calculator (Coming Soon)</div>
      case 'refund':
        return <div>Refund Calculator (Coming Soon)</div>
      default:
        return renderIncomeTaxCalculator()
    }
  }

  if (isEmbedded) {
    return (
      <div className="border rounded-lg p-4 bg-background">
        {content()}
      </div>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calculator className="w-5 h-5" />
          <span>
            {type === 'income_tax' && 'Income Tax Calculator'}
            {type === 'deduction' && 'Deduction Calculator'}
            {type === 'credit' && 'Tax Credit Calculator'}
            {type === 'estimated_payment' && 'Estimated Payment Calculator'}
            {type === 'refund' && 'Refund Calculator'}
          </span>
        </CardTitle>
        <CardDescription>
          Interactive tax calculator with real-time results
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isCalculating && (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            <span>Calculating...</span>
          </div>
        )}
        
        {!isCalculating && content()}
        
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Calculations are estimates for educational purposes only
            </div>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button size="sm" variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
