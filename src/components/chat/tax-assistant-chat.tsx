'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import {
  Send, Paperclip, Search, Bookmark, Download, MoreHorizontal,
  Calculator, Calendar, FileText, Shield, Eye, EyeOff,
  MessageSquare, Users, Bot, User, Clock, CheckCheck, Check,
  AlertTriangle, Info, Zap, Upload, X, Maximize2, Minimize2,
  Hash, Lock, Unlock, Flag, Star, Archive, Filter
} from 'lucide-react'
import { toast } from 'sonner'

interface ChatMessage {
  id: string
  content: string
  type: 'text' | 'calculation' | 'document' | 'form_reference' | 'deadline_reminder'
  sender: 'user' | 'assistant'
  timestamp: string
  isEdited?: boolean
  editedAt?: string
  threadId?: string
  parentMessageId?: string
  attachments?: ChatAttachment[]
  metadata?: {
    formReferences?: string[]
    calculationData?: any
    piiDetected?: boolean
    confidenceScore?: number
    taxTopic?: string
    isBookmarked?: boolean
    complianceNote?: string
  }
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
  reactions?: Array<{
    emoji: string
    userId: string
    timestamp: string
  }>
}

interface ChatAttachment {
  id: string
  name: string
  type: string
  size: number
  url: string
  preview?: string
  ocrData?: {
    extractedText: string
    keyFields: Record<string, any>
    confidence: number
  }
  isProcessing?: boolean
}

interface ChatThread {
  id: string
  title: string
  messages: ChatMessage[]
  lastActivity: string
  participants: string[]
  tags: string[]
  status: 'active' | 'archived' | 'resolved'
}

interface TaxCalculationWidget {
  type: 'income_tax' | 'deduction' | 'credit' | 'estimated_payment'
  data: Record<string, any>
  result: number
  explanation: string[]
}

interface TaxAssistantChatProps {
  userId: string
  assistantId?: string
  onMessageSent?: (message: ChatMessage) => void
  onDocumentUploaded?: (attachment: ChatAttachment) => void
}

const TAX_SUGGESTION_KEYWORDS = [
  'deduction', 'credit', 'income', 'refund', 'filing', 'deadline', 'extension',
  'W-2', '1099', '1040', 'Schedule A', 'Schedule C', 'itemized', 'standard',
  'married filing jointly', 'single', 'head of household', 'dependent',
  'business expense', 'home office', 'charitable', 'medical', 'education',
  'retirement', 'IRA', '401k', 'capital gains', 'depreciation', 'amortization'
]

export default function TaxAssistantChat({ 
  userId, 
  assistantId = 'tax-assistant-1',
  onMessageSent,
  onDocumentUploaded 
}: TaxAssistantChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [assistantTyping, setAssistantTyping] = useState(false)
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [activeThreadId, setActiveThreadId] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [autoCompleteSuggestions, setAutoCompleteSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [piiDetectionEnabled, setPiiDetectionEnabled] = useState(true)
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set())

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messageInputRef = useRef<HTMLTextAreaElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome-1',
      content: `Hello! I'm your AI tax assistant. I can help you with:

• **Tax calculations** - Income tax, deductions, credits
• **Form guidance** - 1040, Schedule A/C, business forms
• **Document analysis** - Upload and analyze tax documents
• **Deadline reminders** - Important tax dates and extensions
• **Tax planning** - Strategies to optimize your tax situation

What would you like help with today?`,
      type: 'text',
      sender: 'assistant',
      timestamp: new Date().toISOString(),
      status: 'read',
      metadata: {
        taxTopic: 'welcome',
        complianceNote: 'This is general information and should not be considered as professional tax advice.'
      }
    }

    setMessages([welcomeMessage])
    
    // Create initial thread
    const initialThread: ChatThread = {
      id: 'main-thread',
      title: 'Tax Assistance Session',
      messages: [welcomeMessage],
      lastActivity: new Date().toISOString(),
      participants: [userId, assistantId],
      tags: ['general'],
      status: 'active'
    }
    
    setThreads([initialThread])
    setActiveThreadId('main-thread')
  }, [userId, assistantId])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-complete functionality
  useEffect(() => {
    if (currentMessage.length > 2) {
      const words = currentMessage.toLowerCase().split(' ')
      const lastWord = words[words.length - 1]
      
      const suggestions = TAX_SUGGESTION_KEYWORDS.filter(keyword =>
        keyword.toLowerCase().includes(lastWord) && 
        keyword.toLowerCase() !== lastWord
      ).slice(0, 5)
      
      setAutoCompleteSuggestions(suggestions)
      setShowSuggestions(suggestions.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }, [currentMessage])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const detectPII = (text: string): boolean => {
    // Basic PII detection patterns
    const patterns = [
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /\b\d{2}-\d{7}\b/, // EIN
      /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, // Credit card
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
      /\b\d{3}[\s-]?\d{3}[\s-]?\d{4}\b/ // Phone
    ]
    
    return patterns.some(pattern => pattern.test(text))
  }

  const sendMessage = async () => {
    if (!currentMessage.trim()) return

    const hasPII = piiDetectionEnabled && detectPII(currentMessage)
    
    if (hasPII) {
      const confirmed = window.confirm(
        'Potential sensitive information detected. Do you want to continue sending this message?'
      )
      if (!confirmed) return
    }

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      content: currentMessage,
      type: 'text',
      sender: 'user',
      timestamp: new Date().toISOString(),
      status: 'sending',
      threadId: activeThreadId,
      metadata: {
        piiDetected: hasPII,
        taxTopic: extractTaxTopic(currentMessage)
      }
    }

    setMessages(prev => [...prev, userMessage])
    setCurrentMessage('')
    setIsTyping(false)
    setShowSuggestions(false)

    // Simulate message being sent
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
      ))
    }, 500)

    // Simulate assistant typing
    setAssistantTyping(true)
    
    try {
      // Simulate API call to tax assistant
      const response = await simulateTaxAssistantResponse(currentMessage)
      
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now()}-assistant`,
          content: response.content,
          type: response.type,
          sender: 'assistant',
          timestamp: new Date().toISOString(),
          status: 'read',
          threadId: activeThreadId,
          metadata: {
            taxTopic: response.taxTopic,
            confidenceScore: response.confidence,
            formReferences: response.formReferences,
            calculationData: response.calculationData,
            complianceNote: 'This information is for educational purposes only. Consult a tax professional for personalized advice.'
          }
        }

        setMessages(prev => [...prev, assistantMessage])
        setAssistantTyping(false)
        
        if (onMessageSent) {
          onMessageSent(assistantMessage)
        }
      }, 1000 + Math.random() * 2000)

    } catch (error) {
      setAssistantTyping(false)
      toast.error('Failed to send message')
    }
  }

  const extractTaxTopic = (message: string): string => {
    const topics = {
      'deduction': ['deduction', 'deduct', 'write off', 'expense'],
      'income': ['income', 'wage', 'salary', 'earnings', 'w-2', '1099'],
      'credit': ['credit', 'tax credit', 'child tax credit', 'earned income credit'],
      'filing': ['file', 'filing', 'submit', 'deadline', 'extension'],
      'business': ['business', 'self employed', 'schedule c', 'llc', 'corporation']
    }

    const messageLower = message.toLowerCase()
    for (const [topic, keywords] of Object.entries(topics)) {
      if (keywords.some(keyword => messageLower.includes(keyword))) {
        return topic
      }
    }
    return 'general'
  }

  const simulateTaxAssistantResponse = async (userMessage: string): Promise<any> => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000))

    const messageLower = userMessage.toLowerCase()

    // Tax calculation response
    if (messageLower.includes('calculate') || messageLower.includes('tax') || messageLower.includes('income')) {
      return {
        content: `I can help you calculate your taxes. Based on your question, here's what I found:

**Income Tax Calculation Example:**
• Gross Income: $75,000
• Standard Deduction (2024): $14,600
• Taxable Income: $60,400
• Federal Tax (est.): $6,905

Would you like me to create a personalized calculation based on your specific situation?`,
        type: 'calculation',
        taxTopic: 'income_tax',
        confidence: 0.85,
        formReferences: ['1040'],
        calculationData: {
          grossIncome: 75000,
          standardDeduction: 14600,
          taxableIncome: 60400,
          federalTax: 6905
        }
      }
    }

    // Deduction response
    if (messageLower.includes('deduction') || messageLower.includes('deduct')) {
      return {
        content: `Here are the main types of tax deductions available:

**Standard vs. Itemized Deductions:**
• Standard Deduction 2024: $14,600 (Single), $29,200 (Married Filing Jointly)
• Itemized Deductions include:
  - Medical expenses (>7.5% of AGI)
  - State and local taxes (up to $10,000)
  - Mortgage interest
  - Charitable contributions

**Business Deductions:**
• Office supplies and equipment
• Business meals (50% deductible)
• Home office expenses
• Professional development

Which type of deductions are you interested in learning more about?`,
        type: 'text',
        taxTopic: 'deductions',
        confidence: 0.92,
        formReferences: ['Schedule A', '1040']
      }
    }

    // Deadline response
    if (messageLower.includes('deadline') || messageLower.includes('due') || messageLower.includes('when')) {
      return {
        content: `**Important Tax Deadlines for 2024:**

📅 **April 15, 2024** - Individual tax returns (Form 1040)
📅 **March 15, 2024** - S-Corp and Partnership returns
📅 **October 15, 2024** - Extended deadline (if extension filed)

⚠️ **Upcoming Estimated Payment Dates:**
• Q4 2024: January 15, 2025
• Q1 2025: April 15, 2025

Would you like me to set up deadline reminders for your specific situation?`,
        type: 'deadline_reminder',
        taxTopic: 'deadlines',
        confidence: 0.98,
        formReferences: ['1040', '1040ES']
      }
    }

    // Default response
    return {
      content: `I understand you're asking about "${userMessage}". 

I can help you with a wide range of tax topics including:
• Tax calculations and planning
• Deduction and credit optimization  
• Form completion guidance
• Deadline management
• Document analysis

Could you provide more specific details about what you'd like help with? For example:
- Are you looking for information about a specific tax form?
- Do you need help calculating something specific?
- Are you trying to understand a particular tax concept?`,
      type: 'text',
      taxTopic: 'general',
      confidence: 0.70
    }
  }

  const handleFileUpload = useCallback(async (files: FileList) => {
    Array.from(files).forEach(async (file) => {
      const attachment: ChatAttachment = {
        id: `attachment-${Date.now()}-${Math.random()}`,
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
        isProcessing: true
      }

      // Create message with attachment
      const attachmentMessage: ChatMessage = {
        id: `msg-${Date.now()}-attachment`,
        content: `Uploaded document: **${file.name}**`,
        type: 'document',
        sender: 'user',
        timestamp: new Date().toISOString(),
        status: 'sent',
        threadId: activeThreadId,
        attachments: [attachment]
      }

      setMessages(prev => [...prev, attachmentMessage])

      // Simulate OCR processing
      setTimeout(async () => {
        const ocrResult = await simulateOCR(file)
        
        const processedAttachment = {
          ...attachment,
          isProcessing: false,
          ocrData: ocrResult
        }

        // Update attachment with OCR data
        setMessages(prev => prev.map(msg => 
          msg.id === attachmentMessage.id 
            ? { ...msg, attachments: [processedAttachment] }
            : msg
        ))

        // Send assistant response about the document
        setTimeout(() => {
          const analysisMessage: ChatMessage = {
            id: `msg-${Date.now()}-analysis`,
            content: `I've analyzed your document **${file.name}**. Here's what I found:

**Key Information Extracted:**
${ocrResult.keyFields.income ? `• Income: $${ocrResult.keyFields.income.toLocaleString()}` : ''}
${ocrResult.keyFields.taxWithheld ? `• Tax Withheld: $${ocrResult.keyFields.taxWithheld.toLocaleString()}` : ''}
${ocrResult.keyFields.employerName ? `• Employer: ${ocrResult.keyFields.employerName}` : ''}

**OCR Confidence:** ${Math.round(ocrResult.confidence * 100)}%

Would you like me to help you understand how to use this information on your tax return?`,
            type: 'document',
            sender: 'assistant',
            timestamp: new Date().toISOString(),
            status: 'read',
            threadId: activeThreadId,
            metadata: {
              taxTopic: 'document_analysis',
              confidenceScore: ocrResult.confidence
            }
          }

          setMessages(prev => [...prev, analysisMessage])
        }, 1500)

        if (onDocumentUploaded) {
          onDocumentUploaded(processedAttachment)
        }
      }, 2000)
    })
  }, [activeThreadId, onDocumentUploaded])

  const simulateOCR = async (file: File): Promise<ChatAttachment['ocrData']> => {
    // Simulate OCR processing
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mock OCR results based on file type
    return {
      extractedText: `Sample extracted text from ${file.name}...`,
      keyFields: {
        income: 75000,
        taxWithheld: 8250,
        employerName: 'ABC Company Inc.',
        documentType: 'W-2',
        taxYear: 2024
      },
      confidence: 0.87
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files)
    }
  }, [handleFileUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }, [])

  const toggleMessageBookmark = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { 
            ...msg, 
            metadata: { 
              ...msg.metadata, 
              isBookmarked: !msg.metadata?.isBookmarked 
            }
          }
        : msg
    ))
  }

  const handleAutoCompleteSelect = (suggestion: string) => {
    const words = currentMessage.split(' ')
    words[words.length - 1] = suggestion
    setCurrentMessage(words.join(' ') + ' ')
    setShowSuggestions(false)
    messageInputRef.current?.focus()
  }

  const renderMessage = (message: ChatMessage, index: number) => {
    const isUser = message.sender === 'user'
    const isSelected = selectedMessages.has(message.id)

    return (
      <div
        key={message.id}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 group`}
      >
        <div className={`flex items-start space-x-3 max-w-[80%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
          <Avatar className="w-8 h-8">
            {isUser ? (
              <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
            ) : (
              <AvatarFallback><Bot className="w-4 h-4" /></AvatarFallback>
            )}
          </Avatar>
          
          <div className={`rounded-lg p-4 ${
            isUser 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted'
          } ${isSelected ? 'ring-2 ring-primary' : ''}`}>
            
            {/* Message Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium">
                  {isUser ? 'You' : 'Tax Assistant'}
                </span>
                {message.metadata?.taxTopic && (
                  <Badge variant="secondary" className="text-xs">
                    {message.metadata.taxTopic}
                  </Badge>
                )}
                {message.metadata?.piiDetected && (
                  <Badge variant="destructive" className="text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    PII
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleMessageBookmark(message.id)}
                  className="h-6 w-6 p-0"
                >
                  <Bookmark className={`w-3 h-3 ${message.metadata?.isBookmarked ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                >
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Message Content */}
            <div className="space-y-2">
              {/* Text content with markdown-like formatting */}
              <div className="whitespace-pre-wrap">
                {message.content.split('\n').map((line, i) => (
                  <div key={i}>
                    {line.startsWith('**') && line.endsWith('**') ? (
                      <strong>{line.slice(2, -2)}</strong>
                    ) : line.startsWith('• ') ? (
                      <div className="ml-4">{line}</div>
                    ) : line.startsWith('📅') || line.startsWith('⚠️') ? (
                      <div className="flex items-center space-x-2">
                        <span>{line.split(' ')[0]}</span>
                        <span>{line.substring(line.indexOf(' ') + 1)}</span>
                      </div>
                    ) : (
                      line
                    )}
                  </div>
                ))}
              </div>

              {/* Tax Calculation Widget */}
              {message.type === 'calculation' && message.metadata?.calculationData && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calculator className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Tax Calculation</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(message.metadata.calculationData).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-blue-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                        <span className="font-medium">${value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Form References */}
              {message.metadata?.formReferences && message.metadata.formReferences.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {message.metadata.formReferences.map(form => (
                    <Badge key={form} variant="outline" className="text-xs">
                      <FileText className="w-3 h-3 mr-1" />
                      {form}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="space-y-2 mt-3">
                  {message.attachments.map(attachment => (
                    <div key={attachment.id} className="p-3 border rounded-lg bg-background">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4" />
                          <div>
                            <div className="font-medium text-sm">{attachment.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {(attachment.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                          </div>
                        </div>
                        {attachment.isProcessing ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            <span className="text-xs">Processing...</span>
                          </div>
                        ) : (
                          <div className="flex space-x-1">
                            <Button size="sm" variant="outline">
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {attachment.ocrData && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                          <div className="flex items-center space-x-1 text-green-700 mb-1">
                            <Zap className="w-3 h-3" />
                            <span>OCR Analysis Complete</span>
                            <Badge variant="secondary" className="text-xs">
                              {Math.round(attachment.ocrData.confidence * 100)}% confidence
                            </Badge>
                          </div>
                          <div className="text-green-600">
                            Key data extracted and ready for use
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Message Footer */}
            <div className="flex items-center justify-between mt-3 text-xs opacity-70">
              <div className="flex items-center space-x-2">
                <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                {message.metadata?.confidenceScore && (
                  <Badge variant="secondary" className="text-xs">
                    {Math.round(message.metadata.confidenceScore * 100)}% confidence
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-1">
                {message.status === 'sending' && <Clock className="w-3 h-3" />}
                {message.status === 'sent' && <Check className="w-3 h-3" />}
                {message.status === 'delivered' && <CheckCheck className="w-3 h-3" />}
                {message.status === 'read' && <CheckCheck className="w-3 h-3 text-blue-500" />}
                {message.status === 'failed' && <AlertTriangle className="w-3 h-3 text-red-500" />}
              </div>
            </div>

            {/* Compliance Footer */}
            {message.metadata?.complianceNote && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                <div className="flex items-start space-x-1">
                  <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>{message.metadata.complianceNote}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-full bg-background border rounded-lg ${isExpanded ? 'fixed inset-4 z-50' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarFallback><Bot className="w-4 h-4" /></AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">Tax Assistant</h3>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Online</span>
              {assistantTyping && (
                <span className="flex items-center space-x-1">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span>typing...</span>
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPiiDetectionEnabled(!piiDetectionEnabled)}
          >
            {piiDetectionEnabled ? (
              <Shield className="w-4 h-4 text-green-500" />
            ) : (
              <Shield className="w-4 h-4 text-red-500" />
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          <Button size="sm" variant="outline">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search conversation history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      )}

      {/* Messages Area */}
      <ScrollArea 
        className="flex-1 p-4"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className={`${dragActive ? 'border-2 border-dashed border-primary bg-primary/5 rounded-lg p-8' : ''}`}>
          {dragActive && (
            <div className="text-center text-primary">
              <Upload className="w-12 h-12 mx-auto mb-2" />
              <p className="font-medium">Drop your tax documents here</p>
              <p className="text-sm">Supported: PDF, PNG, JPG, TIFF</p>
            </div>
          )}
          
          {!dragActive && (
            <div className="space-y-4">
              {messages.map(renderMessage)}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Auto-complete Suggestions */}
      {showSuggestions && (
        <div className="border-t bg-muted/50 p-2">
          <div className="flex flex-wrap gap-1">
            {autoCompleteSuggestions.map(suggestion => (
              <Button
                key={suggestion}
                size="sm"
                variant="ghost"
                className="h-6 text-xs"
                onClick={() => handleAutoCompleteSelect(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t">
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <Textarea
              ref={messageInputRef}
              placeholder="Ask me about taxes, deductions, forms, or upload a document..."
              value={currentMessage}
              onChange={(e) => {
                setCurrentMessage(e.target.value)
                setIsTyping(e.target.value.length > 0)
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              className="min-h-[2.5rem] max-h-32 resize-none"
              rows={1}
            />
            <div className="absolute right-2 bottom-2 flex space-x-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => document.getElementById('file-input')?.click()}
                className="h-6 w-6 p-0"
              >
                <Paperclip className="w-3 h-3" />
              </Button>
              <input
                id="file-input"
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg,.tiff"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                className="hidden"
              />
            </div>
          </div>
          
          <Button
            onClick={sendMessage}
            disabled={!currentMessage.trim() || assistantTyping}
            className="h-10"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        {piiDetectionEnabled && (
          <div className="flex items-center space-x-1 mt-2 text-xs text-muted-foreground">
            <Shield className="w-3 h-3" />
            <span>PII detection enabled - sensitive data will be flagged</span>
          </div>
        )}
      </div>
    </div>
  )
}
