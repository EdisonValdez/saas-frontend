'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import {
  Eye, Download, Zap, AlertTriangle,
  CheckCircle, XCircle, ArrowRight, RotateCcw, Search,
  Maximize2, Minimize2, Copy, Share, Bookmark, X
} from 'lucide-react'
import { toast } from 'sonner'

interface DocumentHighlight {
  id: string
  x: number
  y: number
  width: number
  height: number
  text: string
  category: 'income' | 'deduction' | 'credit' | 'personal_info' | 'dates' | 'amounts'
  confidence: number
  note?: string
}

interface DocumentComparison {
  field: string
  document1Value: any
  document2Value: any
  match: boolean
  confidence: number
  discrepancyType?: 'amount' | 'date' | 'name' | 'missing' | 'format'
  suggestion?: string
}

interface DocumentComparisonToolsProps {
  document1?: {
    id: string
    name: string
    url: string
    ocrData?: any
  }
  document2?: {
    id: string
    name: string
    url: string
    ocrData?: any
  }
  onHighlightSelect?: (highlight: DocumentHighlight) => void
  onComparisonComplete?: (results: DocumentComparison[]) => void
  isOpen: boolean
  onClose: () => void
}

const HIGHLIGHT_CATEGORIES = [
  { 
    value: 'income', 
    label: 'Income/Wages', 
    color: 'bg-green-100 border-green-400 text-green-800',
    description: 'Salary, wages, tips, and other income sources'
  },
  { 
    value: 'deduction', 
    label: 'Deductions', 
    color: 'bg-blue-100 border-blue-400 text-blue-800',
    description: 'Business expenses, charitable contributions, etc.'
  },
  { 
    value: 'credit', 
    label: 'Tax Credits', 
    color: 'bg-purple-100 border-purple-400 text-purple-800',
    description: 'Child tax credit, education credits, etc.'
  },
  { 
    value: 'personal_info', 
    label: 'Personal Info', 
    color: 'bg-yellow-100 border-yellow-400 text-yellow-800',
    description: 'Names, SSN, addresses, and identification'
  },
  { 
    value: 'dates', 
    label: 'Important Dates', 
    color: 'bg-red-100 border-red-400 text-red-800',
    description: 'Tax year, payment dates, deadlines'
  },
  { 
    value: 'amounts', 
    label: 'Tax Amounts', 
    color: 'bg-indigo-100 border-indigo-400 text-indigo-800',
    description: 'Withholdings, payments, refunds'
  }
]

export default function DocumentComparisonTools({
  document1,
  document2,
  onHighlightSelect,
  onComparisonComplete,
  isOpen,
  onClose
}: DocumentComparisonToolsProps) {
  const [highlights1, setHighlights1] = useState<DocumentHighlight[]>([])
  const [highlights2, setHighlights2] = useState<DocumentHighlight[]>([])
  const [comparisons, setComparisons] = useState<DocumentComparison[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isComparing, setIsComparing] = useState(false)
  const [comparisonProgress, setComparisonProgress] = useState(0)
  const [activeDocument, setActiveDocument] = useState<1 | 2>(1)
  const [isHighlightMode, setIsHighlightMode] = useState(false)
  const [selectedHighlight, setSelectedHighlight] = useState<string | null>(null)

  const doc1Ref = useRef<HTMLDivElement>(null)
  const doc2Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (document1 && document2) {
      generateMockHighlights()
    }
  }, [document1, document2])

  const generateMockHighlights = () => {
    // Mock highlights for document 1 (W-2)
    const mockHighlights1: DocumentHighlight[] = [
      {
        id: 'h1-1',
        x: 120,
        y: 80,
        width: 200,
        height: 20,
        text: 'John A. Smith',
        category: 'personal_info',
        confidence: 0.95,
        note: 'Employee name'
      },
      {
        id: 'h1-2',
        x: 120,
        y: 120,
        width: 120,
        height: 20,
        text: '***-**-6789',
        category: 'personal_info',
        confidence: 0.98,
        note: 'Social Security Number'
      },
      {
        id: 'h1-3',
        x: 300,
        y: 200,
        width: 100,
        height: 20,
        text: '$75,000.00',
        category: 'income',
        confidence: 0.92,
        note: 'Wages, tips, other compensation'
      },
      {
        id: 'h1-4',
        x: 300,
        y: 240,
        width: 80,
        height: 20,
        text: '$8,250.00',
        category: 'amounts',
        confidence: 0.89,
        note: 'Federal income tax withheld'
      }
    ]

    // Mock highlights for document 2 (1099)
    const mockHighlights2: DocumentHighlight[] = [
      {
        id: 'h2-1',
        x: 130,
        y: 90,
        width: 200,
        height: 20,
        text: 'John A. Smith',
        category: 'personal_info',
        confidence: 0.94,
        note: 'Recipient name'
      },
      {
        id: 'h2-2',
        x: 130,
        y: 130,
        width: 120,
        height: 20,
        text: '***-**-6789',
        category: 'personal_info',
        confidence: 0.96,
        note: 'Recipient TIN'
      },
      {
        id: 'h2-3',
        x: 310,
        y: 210,
        width: 100,
        height: 20,
        text: '$25,000.00',
        category: 'income',
        confidence: 0.91,
        note: 'Nonemployee compensation'
      },
      {
        id: 'h2-4',
        x: 310,
        y: 250,
        width: 60,
        height: 20,
        text: '$0.00',
        category: 'amounts',
        confidence: 0.98,
        note: 'Federal income tax withheld'
      }
    ]

    setHighlights1(mockHighlights1)
    setHighlights2(mockHighlights2)
  }

  const compareDocuments = async () => {
    if (!document1 || !document2) return

    setIsComparing(true)
    setComparisonProgress(0)

    // Simulate comparison progress
    for (let i = 0; i <= 100; i += 10) {
      setComparisonProgress(i)
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    // Mock comparison results
    const mockComparisons: DocumentComparison[] = [
      {
        field: 'Name',
        document1Value: 'John A. Smith',
        document2Value: 'John A. Smith',
        match: true,
        confidence: 0.95
      },
      {
        field: 'SSN/TIN',
        document1Value: '***-**-6789',
        document2Value: '***-**-6789',
        match: true,
        confidence: 0.97
      },
      {
        field: 'Income Amount',
        document1Value: '$75,000.00',
        document2Value: '$25,000.00',
        match: false,
        confidence: 0.92,
        discrepancyType: 'amount',
        suggestion: 'Different income sources - W-2 wages vs 1099 nonemployee compensation'
      },
      {
        field: 'Federal Withholding',
        document1Value: '$8,250.00',
        document2Value: '$0.00',
        match: false,
        confidence: 0.98,
        discrepancyType: 'amount',
        suggestion: 'No federal tax withheld from 1099 income - may need estimated payments'
      },
      {
        field: 'Employer/Payer',
        document1Value: 'ABC Manufacturing Corp',
        document2Value: 'XYZ Consulting Services',
        match: false,
        confidence: 0.89,
        discrepancyType: 'name',
        suggestion: 'Different income sources - employee vs contractor relationship'
      },
      {
        field: 'Tax Year',
        document1Value: '2024',
        document2Value: '2024',
        match: true,
        confidence: 0.99
      }
    ]

    setComparisons(mockComparisons)
    setIsComparing(false)

    if (onComparisonComplete) {
      onComparisonComplete(mockComparisons)
    }

    toast.success('Document comparison completed')
  }

  const getHighlightStyle = (highlight: DocumentHighlight) => {
    const category = HIGHLIGHT_CATEGORIES.find(c => c.value === highlight.category)
    const isSelected = selectedHighlight === highlight.id
    
    return {
      position: 'absolute' as const,
      left: highlight.x,
      top: highlight.y,
      width: highlight.width,
      height: highlight.height,
      backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.3)' : 'rgba(34, 197, 94, 0.2)',
      border: isSelected ? '2px solid #3b82f6' : `2px solid ${category?.color.includes('green') ? '#22c55e' : '#6366f1'}`,
      borderRadius: '4px',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    }
  }

  const handleHighlightClick = (highlight: DocumentHighlight) => {
    setSelectedHighlight(highlight.id)
    if (onHighlightSelect) {
      onHighlightSelect(highlight)
    }
  }

  const filteredHighlights1 = selectedCategory === 'all' 
    ? highlights1 
    : highlights1.filter(h => h.category === selectedCategory)

  const filteredHighlights2 = selectedCategory === 'all' 
    ? highlights2 
    : highlights2.filter(h => h.category === selectedCategory)

  const getComparisonIcon = (match: boolean, discrepancyType?: string) => {
    if (match) {
      return <CheckCircle className="w-5 h-5 text-green-500" />
    }
    
    switch (discrepancyType) {
      case 'amount':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'missing':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <AlertTriangle className="w-5 h-5 text-orange-500" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Eye className="w-5 h-5" />
            <span>Document Comparison & Highlighting</span>
          </DialogTitle>
          <DialogDescription>
            Compare tax documents and highlight important information
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col h-[calc(95vh-8rem)]">
          {/* Toolbar */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant={isHighlightMode ? 'default' : 'outline'}
                  onClick={() => setIsHighlightMode(!isHighlightMode)}
                >
                  <Highlight className="w-4 h-4 mr-2" />
                  Highlight Mode
                </Button>
                
                <Button
                  size="sm"
                  onClick={compareDocuments}
                  disabled={!document1 || !document2 || isComparing}
                >
                  {isComparing ? (
                    <>
                      <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                      Comparing...
                    </>
                  ) : (
                    <>
                      <FileCompare className="w-4 h-4 mr-2" />
                      Compare
                    </>
                  )}
                </Button>
              </div>

              {/* Category Filter */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Highlight:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value="all">All Categories</option>
                  {HIGHLIGHT_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button size="sm" variant="outline">
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Comparison Progress */}
          {isComparing && (
            <div className="p-4 border-b">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium">Comparing documents...</span>
                <div className="flex-1">
                  <Progress value={comparisonProgress} className="h-2" />
                </div>
                <span className="text-sm text-gray-600">{comparisonProgress}%</span>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="side-by-side" className="h-full">
              <TabsList className="w-full">
                <TabsTrigger value="side-by-side">Side-by-Side View</TabsTrigger>
                <TabsTrigger value="overlay">Overlay View</TabsTrigger>
                <TabsTrigger value="comparison">Comparison Results</TabsTrigger>
                <TabsTrigger value="highlights">Highlight Summary</TabsTrigger>
              </TabsList>

              <TabsContent value="side-by-side" className="h-full">
                <div className="grid grid-cols-2 gap-4 h-full p-4">
                  {/* Document 1 */}
                  <Card className="h-full">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span>{document1?.name || 'Document 1'}</span>
                        <Badge variant="outline">W-2</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="h-full overflow-hidden">
                      <div ref={doc1Ref} className="relative bg-gray-50 border rounded-lg h-96 overflow-auto">
                        {/* Mock document content */}
                        <div className="p-4 text-sm">
                          <div className="text-center font-bold mb-4">Form W-2 - Wage and Tax Statement</div>
                          <div className="space-y-2">
                            <div>Employee: <span className="font-medium">John A. Smith</span></div>
                            <div>SSN: <span className="font-medium">***-**-6789</span></div>
                            <div>Employer: <span className="font-medium">ABC Manufacturing Corp</span></div>
                            <div>EIN: <span className="font-medium">12-3456789</span></div>
                            <div className="mt-4">
                              <div>Wages, tips, other compensation: <span className="font-bold">$75,000.00</span></div>
                              <div>Federal income tax withheld: <span className="font-bold">$8,250.00</span></div>
                              <div>Social security wages: <span className="font-bold">$75,000.00</span></div>
                              <div>Social security tax withheld: <span className="font-bold">$4,650.00</span></div>
                              <div>Medicare wages: <span className="font-bold">$75,000.00</span></div>
                              <div>Medicare tax withheld: <span className="font-bold">$1,087.50</span></div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Highlights overlay */}
                        {filteredHighlights1.map(highlight => (
                          <div
                            key={highlight.id}
                            style={getHighlightStyle(highlight)}
                            onClick={() => handleHighlightClick(highlight)}
                            title={`${highlight.text} - ${highlight.note} (${Math.round(highlight.confidence * 100)}% confidence)`}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Document 2 */}
                  <Card className="h-full">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span>{document2?.name || 'Document 2'}</span>
                        <Badge variant="outline">1099-MISC</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="h-full overflow-hidden">
                      <div ref={doc2Ref} className="relative bg-gray-50 border rounded-lg h-96 overflow-auto">
                        {/* Mock document content */}
                        <div className="p-4 text-sm">
                          <div className="text-center font-bold mb-4">Form 1099-MISC - Miscellaneous Income</div>
                          <div className="space-y-2">
                            <div>Recipient: <span className="font-medium">John A. Smith</span></div>
                            <div>TIN: <span className="font-medium">***-**-6789</span></div>
                            <div>Payer: <span className="font-medium">XYZ Consulting Services</span></div>
                            <div>TIN: <span className="font-medium">98-7654321</span></div>
                            <div className="mt-4">
                              <div>Nonemployee compensation: <span className="font-bold">$25,000.00</span></div>
                              <div>Federal income tax withheld: <span className="font-bold">$0.00</span></div>
                              <div>State tax withheld: <span className="font-bold">$0.00</span></div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Highlights overlay */}
                        {filteredHighlights2.map(highlight => (
                          <div
                            key={highlight.id}
                            style={getHighlightStyle(highlight)}
                            onClick={() => handleHighlightClick(highlight)}
                            title={`${highlight.text} - ${highlight.note} (${Math.round(highlight.confidence * 100)}% confidence)`}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="comparison" className="h-full">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-4">
                    {comparisons.length > 0 ? (
                      <>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <Card>
                            <CardContent className="p-4 text-center">
                              <div className="text-2xl font-bold text-green-600">
                                {comparisons.filter(c => c.match).length}
                              </div>
                              <div className="text-sm text-gray-600">Matches</div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4 text-center">
                              <div className="text-2xl font-bold text-red-600">
                                {comparisons.filter(c => !c.match).length}
                              </div>
                              <div className="text-sm text-gray-600">Discrepancies</div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4 text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                {Math.round(comparisons.reduce((acc, c) => acc + c.confidence, 0) / comparisons.length * 100)}%
                              </div>
                              <div className="text-sm text-gray-600">Avg. Confidence</div>
                            </CardContent>
                          </Card>
                        </div>

                        <div className="space-y-3">
                          {comparisons.map((comparison, index) => (
                            <Card key={index} className={`${!comparison.match ? 'border-yellow-200 bg-yellow-50' : ''}`}>
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center space-x-3">
                                    {getComparisonIcon(comparison.match, comparison.discrepancyType)}
                                    <div>
                                      <div className="font-medium">{comparison.field}</div>
                                      <div className="text-sm text-gray-600">
                                        {comparison.confidence && `${Math.round(comparison.confidence * 100)}% confidence`}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <Badge variant={comparison.match ? 'default' : 'destructive'}>
                                    {comparison.match ? 'Match' : 'Discrepancy'}
                                  </Badge>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 mt-3">
                                  <div>
                                    <div className="text-xs font-medium text-gray-500 mb-1">Document 1 (W-2)</div>
                                    <div className="p-2 bg-white border rounded text-sm">
                                      {comparison.document1Value}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-xs font-medium text-gray-500 mb-1">Document 2 (1099)</div>
                                    <div className="p-2 bg-white border rounded text-sm">
                                      {comparison.document2Value}
                                    </div>
                                  </div>
                                </div>
                                
                                {comparison.suggestion && (
                                  <Alert className="mt-3">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription className="text-sm">
                                      {comparison.suggestion}
                                    </AlertDescription>
                                  </Alert>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <FileCompare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-600 mb-2">No Comparison Results</h3>
                        <p className="text-gray-500">Click "Compare" to analyze the documents</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="highlights" className="h-full">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-4">
                    {/* Highlight Categories Legend */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                      {HIGHLIGHT_CATEGORIES.map(category => (
                        <div key={category.value} className={`p-3 border rounded-lg ${category.color}`}>
                          <div className="font-medium text-sm">{category.label}</div>
                          <div className="text-xs mt-1">{category.description}</div>
                        </div>
                      ))}
                    </div>

                    {/* Highlights by Document */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Document 1 Highlights</CardTitle>
                          <CardDescription>{document1?.name || 'W-2 Form'}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {filteredHighlights1.map(highlight => {
                              const category = HIGHLIGHT_CATEGORIES.find(c => c.value === highlight.category)
                              return (
                                <div
                                  key={highlight.id}
                                  className={`p-3 border rounded cursor-pointer transition-all hover:shadow-sm ${
                                    selectedHighlight === highlight.id ? 'ring-2 ring-blue-500' : ''
                                  }`}
                                  onClick={() => handleHighlightClick(highlight)}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-sm">{highlight.text}</span>
                                    <Badge className={category?.color} variant="secondary">
                                      {category?.label}
                                    </Badge>
                                  </div>
                                  <div className="text-xs text-gray-600">{highlight.note}</div>
                                  <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-gray-500">
                                      Position: ({highlight.x}, {highlight.y})
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                      {Math.round(highlight.confidence * 100)}% confidence
                                    </Badge>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Document 2 Highlights</CardTitle>
                          <CardDescription>{document2?.name || '1099-MISC Form'}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {filteredHighlights2.map(highlight => {
                              const category = HIGHLIGHT_CATEGORIES.find(c => c.value === highlight.category)
                              return (
                                <div
                                  key={highlight.id}
                                  className={`p-3 border rounded cursor-pointer transition-all hover:shadow-sm ${
                                    selectedHighlight === highlight.id ? 'ring-2 ring-blue-500' : ''
                                  }`}
                                  onClick={() => handleHighlightClick(highlight)}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-sm">{highlight.text}</span>
                                    <Badge className={category?.color} variant="secondary">
                                      {category?.label}
                                    </Badge>
                                  </div>
                                  <div className="text-xs text-gray-600">{highlight.note}</div>
                                  <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-gray-500">
                                      Position: ({highlight.x}, {highlight.y})
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                      {Math.round(highlight.confidence * 100)}% confidence
                                    </Badge>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
