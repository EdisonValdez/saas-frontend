'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  Search, Filter, Calendar as CalendarIcon, Download, Bookmark, 
  Star, Archive, Trash2, MessageSquare, Bot, User, Clock,
  FileText, Calculator, AlertTriangle, CheckCircle, X,
  ChevronDown, MoreHorizontal, Share, Copy, Eye
} from 'lucide-react'
import { toast } from 'sonner'

interface ChatMessage {
  id: string
  content: string
  type: 'text' | 'calculation' | 'document' | 'form_reference' | 'deadline_reminder'
  sender: 'user' | 'assistant'
  timestamp: string
  threadId?: string
  metadata?: {
    formReferences?: string[]
    calculationData?: any
    taxTopic?: string
    isBookmarked?: boolean
    complianceNote?: string
    confidenceScore?: number
  }
  attachments?: Array<{
    id: string
    name: string
    type: string
  }>
}

interface ChatSearchHistoryProps {
  messages: ChatMessage[]
  onMessageSelect?: (message: ChatMessage) => void
  onMessagesExport?: (messages: ChatMessage[]) => void
  onMessageBookmark?: (messageId: string) => void
  onMessageDelete?: (messageId: string) => void
  isOpen: boolean
  onClose: () => void
}

interface SearchFilters {
  query: string
  dateRange: {
    from: Date | null
    to: Date | null
  }
  sender: 'all' | 'user' | 'assistant'
  messageType: 'all' | 'text' | 'calculation' | 'document' | 'form_reference' | 'deadline_reminder'
  taxTopic: string
  hasAttachments: boolean
  isBookmarked: boolean
  hasFormReferences: boolean
}

const TAX_TOPICS = [
  'all',
  'income_tax',
  'deductions',
  'credits',
  'deadlines',
  'business',
  'document_analysis',
  'forms',
  'general'
]

export default function ChatSearchHistory({
  messages,
  onMessageSelect,
  onMessagesExport,
  onMessageBookmark,
  onMessageDelete,
  isOpen,
  onClose
}: ChatSearchHistoryProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    dateRange: { from: null, to: null },
    sender: 'all',
    messageType: 'all',
    taxTopic: 'all',
    hasAttachments: false,
    isBookmarked: false,
    hasFormReferences: false
  })

  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set())
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'relevance'>('newest')
  const [summaryData, setSummaryData] = useState<any>(null)

  // Filter and search messages
  const filteredMessages = useMemo(() => {
    let filtered = [...messages]

    // Text search
    if (filters.query.trim()) {
      const query = filters.query.toLowerCase()
      filtered = filtered.filter(msg =>
        msg.content.toLowerCase().includes(query) ||
        msg.metadata?.taxTopic?.toLowerCase().includes(query) ||
        msg.metadata?.formReferences?.some(ref => ref.toLowerCase().includes(query)) ||
        msg.attachments?.some(att => att.name.toLowerCase().includes(query))
      )
    }

    // Date range filter
    if (filters.dateRange.from) {
      filtered = filtered.filter(msg => new Date(msg.timestamp) >= filters.dateRange.from!)
    }
    if (filters.dateRange.to) {
      filtered = filtered.filter(msg => new Date(msg.timestamp) <= filters.dateRange.to!)
    }

    // Sender filter
    if (filters.sender !== 'all') {
      filtered = filtered.filter(msg => msg.sender === filters.sender)
    }

    // Message type filter
    if (filters.messageType !== 'all') {
      filtered = filtered.filter(msg => msg.type === filters.messageType)
    }

    // Tax topic filter
    if (filters.taxTopic !== 'all') {
      filtered = filtered.filter(msg => msg.metadata?.taxTopic === filters.taxTopic)
    }

    // Attachments filter
    if (filters.hasAttachments) {
      filtered = filtered.filter(msg => msg.attachments && msg.attachments.length > 0)
    }

    // Bookmarked filter
    if (filters.isBookmarked) {
      filtered = filtered.filter(msg => msg.metadata?.isBookmarked === true)
    }

    // Form references filter
    if (filters.hasFormReferences) {
      filtered = filtered.filter(msg => msg.metadata?.formReferences && msg.metadata.formReferences.length > 0)
    }

    // Sort messages
    filtered.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime()
      const dateB = new Date(b.timestamp).getTime()
      
      switch (sortBy) {
        case 'newest':
          return dateB - dateA
        case 'oldest':
          return dateA - dateB
        case 'relevance':
          // Simple relevance scoring based on filters match
          let scoreA = 0, scoreB = 0
          if (filters.query) {
            scoreA += a.content.toLowerCase().includes(filters.query.toLowerCase()) ? 2 : 0
            scoreB += b.content.toLowerCase().includes(filters.query.toLowerCase()) ? 2 : 0
          }
          if (a.metadata?.isBookmarked) scoreA += 1
          if (b.metadata?.isBookmarked) scoreB += 1
          return scoreB - scoreA
        default:
          return dateB - dateA
      }
    })

    return filtered
  }, [messages, filters, sortBy])

  // Generate conversation summary
  useEffect(() => {
    if (filteredMessages.length > 0) {
      generateSummary(filteredMessages)
    }
  }, [filteredMessages])

  const generateSummary = (msgs: ChatMessage[]) => {
    const topics = new Map<string, number>()
    const formsDiscussed = new Set<string>()
    const calculationsPerformed = msgs.filter(m => m.type === 'calculation').length
    const documentsAnalyzed = msgs.filter(m => m.type === 'document').length

    msgs.forEach(msg => {
      if (msg.metadata?.taxTopic) {
        topics.set(msg.metadata.taxTopic, (topics.get(msg.metadata.taxTopic) || 0) + 1)
      }
      if (msg.metadata?.formReferences) {
        msg.metadata.formReferences.forEach(ref => formsDiscussed.add(ref))
      }
    })

    setSummaryData({
      totalMessages: msgs.length,
      userMessages: msgs.filter(m => m.sender === 'user').length,
      assistantMessages: msgs.filter(m => m.sender === 'assistant').length,
      topTopics: Array.from(topics.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      formsDiscussed: Array.from(formsDiscussed),
      calculationsPerformed,
      documentsAnalyzed,
      bookmarkedMessages: msgs.filter(m => m.metadata?.isBookmarked).length
    })
  }

  const clearFilters = () => {
    setFilters({
      query: '',
      dateRange: { from: null, to: null },
      sender: 'all',
      messageType: 'all',
      taxTopic: 'all',
      hasAttachments: false,
      isBookmarked: false,
      hasFormReferences: false
    })
  }

  const toggleMessageSelection = (messageId: string) => {
    setSelectedMessages(prev => {
      const newSet = new Set(prev)
      if (newSet.has(messageId)) {
        newSet.delete(messageId)
      } else {
        newSet.add(messageId)
      }
      return newSet
    })
  }

  const selectAllVisible = () => {
    setSelectedMessages(new Set(filteredMessages.map(m => m.id)))
  }

  const clearSelection = () => {
    setSelectedMessages(new Set())
  }

  const exportSelected = () => {
    const selected = filteredMessages.filter(m => selectedMessages.has(m.id))
    if (onMessagesExport) {
      onMessagesExport(selected)
    }
    toast.success(`Exported ${selected.length} messages`)
  }

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'calculation':
        return <Calculator className="w-4 h-4 text-blue-500" />
      case 'document':
        return <FileText className="w-4 h-4 text-green-500" />
      case 'form_reference':
        return <FileText className="w-4 h-4 text-purple-500" />
      case 'deadline_reminder':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      default:
        return <MessageSquare className="w-4 h-4 text-gray-500" />
    }
  }

  const getTaxTopicColor = (topic: string) => {
    const colors: Record<string, string> = {
      'income_tax': 'bg-blue-100 text-blue-800',
      'deductions': 'bg-green-100 text-green-800',
      'credits': 'bg-purple-100 text-purple-800',
      'deadlines': 'bg-red-100 text-red-800',
      'business': 'bg-orange-100 text-orange-800',
      'document_analysis': 'bg-teal-100 text-teal-800',
      'forms': 'bg-indigo-100 text-indigo-800',
      'general': 'bg-gray-100 text-gray-800'
    }
    return colors[topic] || 'bg-gray-100 text-gray-800'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Search Chat History</span>
          </DialogTitle>
          <DialogDescription>
            Find and manage your tax assistant conversations
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col h-[calc(90vh-8rem)]">
          {/* Search and Filters */}
          <div className="space-y-4 p-4 border-b">
            {/* Main Search */}
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search messages, topics, forms..."
                  value={filters.query}
                  onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                Clear
              </Button>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Range</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full justify-start text-left">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {filters.dateRange.from ? (
                          filters.dateRange.to ? (
                            `${filters.dateRange.from.toLocaleDateString()} - ${filters.dateRange.to.toLocaleDateString()}`
                          ) : (
                            filters.dateRange.from.toLocaleDateString()
                          )
                        ) : (
                          'Select dates'
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={{
                          from: filters.dateRange.from || undefined,
                          to: filters.dateRange.to || undefined
                        }}
                        onSelect={(range) => {
                          setFilters(prev => ({
                            ...prev,
                            dateRange: {
                              from: range?.from || null,
                              to: range?.to || null
                            }
                          }))
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Sender</label>
                  <Select value={filters.sender} onValueChange={(value) => 
                    setFilters(prev => ({ ...prev, sender: value as any }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="user">You</SelectItem>
                      <SelectItem value="assistant">Assistant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Message Type</label>
                  <Select value={filters.messageType} onValueChange={(value) => 
                    setFilters(prev => ({ ...prev, messageType: value as any }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="calculation">Calculations</SelectItem>
                      <SelectItem value="document">Documents</SelectItem>
                      <SelectItem value="form_reference">Form References</SelectItem>
                      <SelectItem value="deadline_reminder">Deadline Reminders</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tax Topic</label>
                  <Select value={filters.taxTopic} onValueChange={(value) => 
                    setFilters(prev => ({ ...prev, taxTopic: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TAX_TOPICS.map(topic => (
                        <SelectItem key={topic} value={topic}>
                          {topic === 'all' ? 'All Topics' : topic.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Special Filters</label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasAttachments"
                        checked={filters.hasAttachments}
                        onCheckedChange={(checked) => 
                          setFilters(prev => ({ ...prev, hasAttachments: !!checked }))
                        }
                      />
                      <label htmlFor="hasAttachments" className="text-sm">Has attachments</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isBookmarked"
                        checked={filters.isBookmarked}
                        onCheckedChange={(checked) => 
                          setFilters(prev => ({ ...prev, isBookmarked: !!checked }))
                        }
                      />
                      <label htmlFor="isBookmarked" className="text-sm">Bookmarked</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasFormReferences"
                        checked={filters.hasFormReferences}
                        onCheckedChange={(checked) => 
                          setFilters(prev => ({ ...prev, hasFormReferences: !!checked }))
                        }
                      />
                      <label htmlFor="hasFormReferences" className="text-sm">Has form references</label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {filteredMessages.length} messages found
                </span>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                  <SelectTrigger className="w-auto">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest first</SelectItem>
                    <SelectItem value="oldest">Oldest first</SelectItem>
                    <SelectItem value="relevance">Most relevant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bulk Actions */}
              {selectedMessages.size > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {selectedMessages.size} selected
                  </span>
                  <Button size="sm" variant="outline" onClick={exportSelected}>
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                  <Button size="sm" variant="outline" onClick={clearSelection}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={selectAllVisible}>
                  Select All
                </Button>
                <Button size="sm" variant="outline" onClick={() => onMessagesExport?.(filteredMessages)}>
                  <Download className="w-4 h-4 mr-2" />
                  Export All
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="messages" className="h-full">
              <TabsList className="w-full">
                <TabsTrigger value="messages">Messages ({filteredMessages.length})</TabsTrigger>
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
              </TabsList>

              <TabsContent value="messages" className="h-full">
                <ScrollArea className="h-full">
                  <div className="space-y-3 p-4">
                    {filteredMessages.map((message) => (
                      <Card 
                        key={message.id} 
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedMessages.has(message.id) ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => onMessageSelect?.(message)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              checked={selectedMessages.has(message.id)}
                              onCheckedChange={() => toggleMessageSelection(message.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            
                            <Avatar className="w-8 h-8">
                              <AvatarFallback>
                                {message.sender === 'user' ? 
                                  <User className="w-4 h-4" /> : 
                                  <Bot className="w-4 h-4" />
                                }
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-sm">
                                    {message.sender === 'user' ? 'You' : 'Tax Assistant'}
                                  </span>
                                  {getMessageIcon(message.type)}
                                  <span className="text-xs text-gray-500">
                                    {new Date(message.timestamp).toLocaleString()}
                                  </span>
                                </div>
                                
                                <div className="flex items-center space-x-1">
                                  {message.metadata?.isBookmarked && (
                                    <Bookmark className="w-4 h-4 text-yellow-500 fill-current" />
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onMessageBookmark?.(message.id)
                                    }}
                                    className="h-6 w-6 p-0"
                                  >
                                    <MoreHorizontal className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>

                              <div className="text-sm text-gray-600 line-clamp-2 mb-2">
                                {message.content}
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {message.metadata?.taxTopic && (
                                  <Badge variant="secondary" className={`text-xs ${getTaxTopicColor(message.metadata.taxTopic)}`}>
                                    {message.metadata.taxTopic.replace('_', ' ')}
                                  </Badge>
                                )}
                                
                                {message.metadata?.formReferences?.map(form => (
                                  <Badge key={form} variant="outline" className="text-xs">
                                    {form}
                                  </Badge>
                                ))}
                                
                                {message.attachments && message.attachments.length > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    <FileText className="w-3 h-3 mr-1" />
                                    {message.attachments.length} file{message.attachments.length > 1 ? 's' : ''}
                                  </Badge>
                                )}
                                
                                {message.metadata?.confidenceScore && (
                                  <Badge variant="secondary" className="text-xs">
                                    {Math.round(message.metadata.confidenceScore * 100)}% confidence
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {filteredMessages.length === 0 && (
                      <div className="text-center py-12">
                        <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-600 mb-2">No messages found</h3>
                        <p className="text-gray-500">Try adjusting your search criteria or filters</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="summary" className="h-full">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-6">
                    {summaryData && (
                      <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <Card>
                            <CardContent className="p-4 text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                {summaryData.totalMessages}
                              </div>
                              <div className="text-sm text-gray-600">Total Messages</div>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardContent className="p-4 text-center">
                              <div className="text-2xl font-bold text-green-600">
                                {summaryData.calculationsPerformed}
                              </div>
                              <div className="text-sm text-gray-600">Calculations</div>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardContent className="p-4 text-center">
                              <div className="text-2xl font-bold text-purple-600">
                                {summaryData.documentsAnalyzed}
                              </div>
                              <div className="text-sm text-gray-600">Documents</div>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardContent className="p-4 text-center">
                              <div className="text-2xl font-bold text-yellow-600">
                                {summaryData.bookmarkedMessages}
                              </div>
                              <div className="text-sm text-gray-600">Bookmarked</div>
                            </CardContent>
                          </Card>
                        </div>

                        <Card>
                          <CardHeader>
                            <CardTitle>Top Discussion Topics</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {summaryData.topTopics.map(([topic, count]: [string, number]) => (
                                <div key={topic} className="flex items-center justify-between">
                                  <span className="capitalize">{topic.replace('_', ' ')}</span>
                                  <Badge variant="secondary">{count} messages</Badge>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle>Forms Discussed</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              {summaryData.formsDiscussed.map((form: string) => (
                                <Badge key={form} variant="outline">
                                  {form}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="bookmarks" className="h-full">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <div className="space-y-3">
                      {filteredMessages
                        .filter(m => m.metadata?.isBookmarked)
                        .map((message) => (
                          <Card key={message.id} className="cursor-pointer hover:shadow-md">
                            <CardContent className="p-4">
                              <div className="flex items-start space-x-3">
                                <Star className="w-5 h-5 text-yellow-500 fill-current mt-1" />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-sm">
                                      {message.sender === 'user' ? 'You' : 'Tax Assistant'}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {new Date(message.timestamp).toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {message.content}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
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
