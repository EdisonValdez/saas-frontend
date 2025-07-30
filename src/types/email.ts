export interface EmailAttachment {
    id: string
    filename: string
    type: string
    size: number
    downloadUrl?: string
}

export interface Email {
    id: string
    from: string
    fromName: string
    to: string[]
    subject: string
    content: string
    htmlContent?: string
    date: Date
    isRead: boolean
    isStarred: boolean
    hasAttachments: boolean
    attachments: EmailAttachment[]
    priority: 'low' | 'normal' | 'high' | 'urgent'
    folder: string
    labels: string[]
    threadId?: string
    inReplyTo?: string
    messageId: string
}

export interface EmailThread {
    id: string
    subject: string
    participants: string[]
    messageCount: number
    lastMessageDate: Date
    isRead: boolean
    hasUnread: boolean
    labels: string[]
    folder: string
    emails: Email[]
}

export interface EmailFolder {
    id: string
    name: string
    type: 'inbox' | 'sent' | 'drafts' | 'archive' | 'trash' | 'custom'
    unreadCount: number
    totalCount: number
    color?: string
    icon?: string
}

export interface EmailFilter {
    sender?: string
    subject?: string
    dateFrom?: Date
    dateTo?: Date
    hasAttachments?: boolean
    isRead?: boolean
    priority?: Email['priority']
    folder?: string
    labels?: string[]
    taxFormType?: string
    taxYear?: string
    search?: string
}

export interface EmailSort {
    field: 'date' | 'from' | 'subject' | 'priority'
    direction: 'asc' | 'desc'
}

export interface TriageDecision {
    action: 'auto_respond' | 'needs_review' | 'schedule_meeting' | 'forward'
    confidence: number
    reasoning: string
    suggestedResponse?: string
    estimatedResponseTime?: string
}

export interface ExtractedTaxData {
    formType?: string
    taxYear?: string
    amounts?: Record<string, number>
    dates?: Record<string, string>
    clientName?: string
    ssn?: string
    ein?: string
}

export interface EmailAnalysis {
    triage: TriageDecision
    extractedData?: ExtractedTaxData
    suggestedActions?: Array<{
        type: string
        description: string
        priority: 'low' | 'medium' | 'high'
    }>
    compliance?: {
        hasPII: boolean
        hasSSN: boolean
        sensitivityLevel: 'low' | 'medium' | 'high'
        warnings: string[]
    }
    sentiment?: 'positive' | 'neutral' | 'negative' | 'urgent'
}

export interface DraftEmail {
    id: string
    to: string[]
    cc?: string[]
    bcc?: string[]
    subject: string
    content: string
    htmlContent?: string
    attachments: EmailAttachment[]
    inReplyTo?: string
    threadId?: string
    scheduledSend?: Date
    isAiGenerated: boolean
    aiConfidence?: number
}

export interface EmailTemplate {
    id: string
    name: string
    subject: string
    content: string
    htmlContent?: string
    category: string
    tags: string[]
    variables: Array<{
        name: string
        description: string
        defaultValue?: string
    }>
}

export interface EmailAction {
    type: 'reply' | 'forward' | 'archive' | 'delete' | 'mark_read' | 'mark_unread' | 'star' | 'move' | 'label'
    emailIds: string[]
    targetFolder?: string
    targetLabels?: string[]
    replyContent?: string
}

export interface EmailStats {
    totalEmails: number
    unreadEmails: number
    todayEmails: number
    avgResponseTime: number
    triageStats: {
        autoRespond: number
        needsReview: number
        scheduleMeeting: number
        forward: number
    }
}

export interface UserPreferences {
    emailsPerPage: number
    defaultSort: EmailSort
    autoPreview: boolean
    showImages: boolean
    compactView: boolean
    triageSettings: {
        autoApproveConfidenceThreshold: number
        enableAutoResponse: boolean
        requireApprovalForSensitiveEmails: boolean
    }
    notificationSettings: {
        newEmailSound: boolean
        desktopNotifications: boolean
        emailNotifications: boolean
    }
}
