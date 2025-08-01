'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
    History,
    User,
    Calendar,
    FileText,
    Plus,
    Edit,
    Trash2,
    RefreshCw,
    ChevronDown,
    ChevronRight,
    GitBranch,
    Tag,
    Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useTaxFormTemplateChanges, useCreateTemplateVersion, useTaxFormTemplate } from '@/hooks/use-tax-form-templates'
import type { TaxFormTemplateChange } from '@/types/tax-forms'
import { cn } from '@/lib/utils'

interface TemplateVersionHistoryProps {
    templateId: string
    className?: string
}

export default function TemplateVersionHistory({ templateId, className }: TemplateVersionHistoryProps) {
    const [expandedChanges, setExpandedChanges] = useState<Set<string>>(new Set())
    const [showCreateVersion, setShowCreateVersion] = useState(false)
    const [newVersionData, setNewVersionData] = useState({
        change_reason: '',
        description: '',
    })

    const { data: template } = useTaxFormTemplate(templateId)
    const { data: changes, isLoading, error, refetch } = useTaxFormTemplateChanges(templateId)
    const createVersionMutation = useCreateTemplateVersion()

    const toggleExpanded = (changeId: string) => {
        const newExpanded = new Set(expandedChanges)
        if (newExpanded.has(changeId)) {
            newExpanded.delete(changeId)
        } else {
            newExpanded.add(changeId)
        }
        setExpandedChanges(newExpanded)
    }

    const handleCreateVersion = () => {
        if (!newVersionData.change_reason.trim()) return

        createVersionMutation.mutate(
            {
                templateId,
                request: {
                    change_reason: newVersionData.change_reason,
                },
            },
            {
                onSuccess: () => {
                    setShowCreateVersion(false)
                    setNewVersionData({ change_reason: '', description: '' })
                },
            }
        )
    }

    const getChangeTypeIcon = (changeType: TaxFormTemplateChange['change_type']) => {
        switch (changeType) {
            case 'created':
                return <Plus className="h-4 w-4 text-green-600" />
            case 'updated':
                return <Edit className="h-4 w-4 text-blue-600" />
            case 'deleted':
                return <Trash2 className="h-4 w-4 text-red-600" />
            case 'synced':
                return <RefreshCw className="h-4 w-4 text-purple-600" />
            default:
                return <FileText className="h-4 w-4 text-gray-600" />
        }
    }

    const getChangeTypeLabel = (changeType: TaxFormTemplateChange['change_type']) => {
        switch (changeType) {
            case 'created':
                return 'Created'
            case 'updated':
                return 'Updated'
            case 'deleted':
                return 'Deleted'
            case 'synced':
                return 'Synced'
            default:
                return changeType
        }
    }

    const getChangeTypeBadgeColor = (changeType: TaxFormTemplateChange['change_type']) => {
        switch (changeType) {
            case 'created':
                return 'bg-green-100 text-green-800'
            case 'updated':
                return 'bg-blue-100 text-blue-800'
            case 'deleted':
                return 'bg-red-100 text-red-800'
            case 'synced':
                return 'bg-purple-100 text-purple-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const formatChangeDescription = (change: TaxFormTemplateChange['changes'][0]) => {
        const { action, field, description } = change

        if (description) return description

        if (field) {
            switch (action) {
                case 'added':
                    return `Added field "${field}"`
                case 'removed':
                    return `Removed field "${field}"`
                case 'modified':
                    return `Modified field "${field}"`
                default:
                    return `${action} ${field}`
            }
        }

        return `${action} change`
    }

    const LoadingSkeleton = () => (
        <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i}>
                    <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-64" />
                                <Skeleton className="h-3 w-48" />
                            </div>
                            <Skeleton className="h-6 w-16" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )

    if (isLoading) {
        return (
            <div className={cn('space-y-6', className)}>
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <LoadingSkeleton />
            </div>
        )
    }

    if (error) {
        return (
            <div className={cn('space-y-6', className)}>
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4">
                        <p className="text-red-800">Failed to load version history.</p>
                        <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className={cn('space-y-6', className)}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <History className="h-6 w-6 text-gray-600" />
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Version History</h3>
                        <p className="text-sm text-gray-600">Track changes and create new versions of this template</p>
                    </div>
                </div>

                <Dialog open={showCreateVersion} onOpenChange={setShowCreateVersion}>
                    <DialogTrigger asChild>
                        <Button>
                            <GitBranch className="h-4 w-4 mr-2" />
                            Create Version
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Version</DialogTitle>
                            <DialogDescription>
                                Create a new version of this template with your changes.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="change-reason">Change Reason *</Label>
                                <Input
                                    id="change-reason"
                                    placeholder="Brief description of changes..."
                                    value={newVersionData.change_reason}
                                    onChange={(e) =>
                                        setNewVersionData((prev) => ({
                                            ...prev,
                                            change_reason: e.target.value,
                                        }))
                                    }
                                />
                            </div>

                            <div>
                                <Label htmlFor="description">Detailed Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Optional detailed description..."
                                    value={newVersionData.description}
                                    onChange={(e) =>
                                        setNewVersionData((prev) => ({
                                            ...prev,
                                            description: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowCreateVersion(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreateVersion}
                                disabled={!newVersionData.change_reason.trim() || createVersionMutation.isPending}
                            >
                                {createVersionMutation.isPending && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                                Create Version
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Current Version Info */}
            {template && (
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Tag className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">Current Version: {template.version}</p>
                                    <p className="text-sm text-gray-600">
                                        Last modified {formatDistanceToNow(new Date(template.metadata.last_modified))}{' '}
                                        ago
                                    </p>
                                </div>
                            </div>
                            <Badge variant="secondary">Active</Badge>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Change History */}
            <div className="space-y-4">
                {!changes || changes.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">No version history available yet.</p>
                            <p className="text-sm text-gray-500 mt-1">
                                Changes will appear here as you modify the template.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    changes.map((change, index) => (
                        <Card key={change.id} className="overflow-hidden">
                            <CardContent className="p-0">
                                <div className="p-4">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0">
                                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                                                {getChangeTypeIcon(change.change_type)}
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge className={getChangeTypeBadgeColor(change.change_type)}>
                                                    {getChangeTypeLabel(change.change_type)}
                                                </Badge>
                                                <span className="text-sm font-medium text-gray-900">
                                                    Version {change.version}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                                <div className="flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    {change.changed_by}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDistanceToNow(new Date(change.changed_at))} ago
                                                </div>
                                            </div>

                                            {change.change_reason && (
                                                <p className="text-sm text-gray-800 mb-3">{change.change_reason}</p>
                                            )}

                                            {change.changes.length > 0 && (
                                                <Collapsible>
                                                    <CollapsibleTrigger
                                                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                                                        onClick={() => toggleExpanded(change.id)}
                                                    >
                                                        {expandedChanges.has(change.id) ? (
                                                            <ChevronDown className="h-4 w-4" />
                                                        ) : (
                                                            <ChevronRight className="h-4 w-4" />
                                                        )}
                                                        View {change.changes.length} change
                                                        {change.changes.length !== 1 ? 's' : ''}
                                                    </CollapsibleTrigger>

                                                    <CollapsibleContent className="mt-3">
                                                        <div className="space-y-2 pl-6 border-l-2 border-gray-200">
                                                            {change.changes.map((changeDetail, i) => (
                                                                <div key={i} className="text-sm">
                                                                    <div className="flex items-center gap-2">
                                                                        <Badge variant="outline" className="text-xs">
                                                                            {changeDetail.action}
                                                                        </Badge>
                                                                        <span className="text-gray-700">
                                                                            {formatChangeDescription(changeDetail)}
                                                                        </span>
                                                                    </div>
                                                                    {changeDetail.old_value &&
                                                                        changeDetail.new_value && (
                                                                            <div className="mt-1 text-xs text-gray-500">
                                                                                <span className="line-through text-red-600">
                                                                                    {String(changeDetail.old_value)}
                                                                                </span>
                                                                                {' → '}
                                                                                <span className="text-green-600">
                                                                                    {String(changeDetail.new_value)}
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </CollapsibleContent>
                                                </Collapsible>
                                            )}
                                        </div>

                                        <div className="flex-shrink-0">
                                            <Badge variant="outline" className="text-xs">
                                                {new Date(change.changed_at).toLocaleDateString()}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                {index < changes.length - 1 && <Separator />}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
