'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
    Search,
    Plus,
    Filter,
    Users,
    Building,
    User,
    ArrowUpDown,
    MoreHorizontal,
    AlertTriangle,
    Crown,
    TrendingUp,
    Calendar,
    FileText,
    Mail,
    Phone,
    MapPin,
    Archive,
    ArchiveRestore,
    Edit,
    Eye,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Workspace } from '@/types/workspaces'

// Types
interface Client {
    id: string
    name: string
    status: 'active' | 'archived'
    entity_type: 'individual' | 'corporation' | 'partnership' | 'llc' | 'nonprofit' | 'trust'
    document_count: number
    workspace: string
    metadata: {
        email?: string
        phone?: string
        address?: string
        tax_id?: string
        notes?: string
        created_date: string
        last_updated: string
        last_activity?: string
    }
}

interface SubscriptionLimits {
    maxClients: number
    currentClients: number
    aiCredits: number
    usedCredits: number
    features: string[]
    planName: string
    planType: 'starter' | 'professional' | 'enterprise'
}

interface ClientManagementDashboardProps {
    workspace: Workspace
}

// Mock data for subscription limits based on plan
const getSubscriptionLimits = (workspace: Workspace): SubscriptionLimits => {
    // In real implementation, this would come from the workspace.subscription
    const planType = workspace.subscription?.status === 'active' ? 'professional' : 'starter'

    const limits = {
        starter: {
            maxClients: 25,
            aiCredits: 1000,
            features: ['Basic Client Management', 'Document Upload', 'Email Support'],
        },
        professional: {
            maxClients: 100,
            aiCredits: 5000,
            features: ['Advanced Client Management', 'Tax Assistant', 'Email Agent', 'Priority Support'],
        },
        enterprise: {
            maxClients: 500,
            aiCredits: 25000,
            features: ['Unlimited Features', 'Dedicated Support', 'Custom Integrations'],
        },
    }

    return {
        ...limits[planType],
        currentClients: Math.floor(Math.random() * limits[planType].maxClients * 0.8), // Mock current usage
        usedCredits: Math.floor(Math.random() * limits[planType].aiCredits * 0.6), // Mock credit usage
        planName: planType.charAt(0).toUpperCase() + planType.slice(1),
        planType,
    }
}

// Mock client data
const generateMockClients = (workspaceId: string, count: number): Client[] => {
    const entityTypes = ['individual', 'corporation', 'partnership', 'llc', 'nonprofit', 'trust'] as const
    const statuses = ['active', 'archived'] as const

    const clientNames = [
        'Johnson & Associates',
        'Smith Corp',
        'Miller LLC',
        'Davis Partnership',
        'Wilson Trust',
        'Brown Enterprises',
        'Taylor & Co',
        'Anderson Inc',
        'Thomas Holdings',
        'Jackson Group',
        'White Industries',
        'Harris Consulting',
        'Martin Services',
        'Thompson LLC',
        'Garcia & Partners',
        'Rodriguez Corp',
        'Lewis Ventures',
        'Lee Enterprises',
        'Walker & Associates',
        'Hall Industries',
    ]

    return Array.from({ length: count }, (_, i) => ({
        id: `client-${i + 1}`,
        name:
            clientNames[i % clientNames.length] +
            (i >= clientNames.length ? ` ${Math.floor(i / clientNames.length) + 1}` : ''),
        status: statuses[Math.random() > 0.8 ? 1 : 0],
        entity_type: entityTypes[Math.floor(Math.random() * entityTypes.length)],
        document_count: Math.floor(Math.random() * 50),
        workspace: workspaceId,
        metadata: {
            email: `contact@${clientNames[i % clientNames.length].toLowerCase().replace(/[^a-z]/g, '')}.com`,
            phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
            address: `${Math.floor(Math.random() * 9999) + 1} Main St, City, ST ${Math.floor(Math.random() * 90000) + 10000}`,
            tax_id: `${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 9000000) + 1000000}`,
            created_date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
            last_updated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            last_activity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            notes: Math.random() > 0.5 ? 'Important client with complex tax requirements.' : undefined,
        },
    }))
}

const ENTITY_TYPE_LABELS = {
    individual: 'Individual',
    corporation: 'Corporation',
    partnership: 'Partnership',
    llc: 'LLC',
    nonprofit: 'Nonprofit',
    trust: 'Trust',
}

const ENTITY_TYPE_ICONS = {
    individual: User,
    corporation: Building,
    partnership: Users,
    llc: Building,
    nonprofit: Building,
    trust: Building,
}

export function ClientManagementDashboard({ workspace }: ClientManagementDashboardProps) {
    const [clients, setClients] = useState<Client[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all')
    const [entityFilter, setEntityFilter] = useState<'all' | Client['entity_type']>('all')
    const [sortField, setSortField] = useState<'name' | 'created_date' | 'last_activity'>('name')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
    const [showAddDialog, setShowAddDialog] = useState(false)
    const [selectedClient, setSelectedClient] = useState<Client | null>(null)

    const subscriptionLimits = useMemo(() => getSubscriptionLimits(workspace), [workspace])

    // Load mock data
    useEffect(() => {
        setLoading(true)
        // Simulate API call
        setTimeout(() => {
            const mockClients = generateMockClients(workspace.id, subscriptionLimits.currentClients)
            setClients(mockClients)
            setLoading(false)
        }, 1000)
    }, [workspace.id, subscriptionLimits.currentClients])

    // Filter and sort clients
    const filteredAndSortedClients = useMemo(() => {
        let filtered = clients.filter((client) => {
            const matchesSearch =
                client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.metadata.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.metadata.tax_id?.includes(searchTerm)

            const matchesStatus = statusFilter === 'all' || client.status === statusFilter
            const matchesEntity = entityFilter === 'all' || client.entity_type === entityFilter

            return matchesSearch && matchesStatus && matchesEntity
        })

        // Sort
        filtered.sort((a, b) => {
            let aValue: any, bValue: any

            switch (sortField) {
                case 'name':
                    aValue = a.name.toLowerCase()
                    bValue = b.name.toLowerCase()
                    break
                case 'created_date':
                    aValue = new Date(a.metadata.created_date)
                    bValue = new Date(b.metadata.created_date)
                    break
                case 'last_activity':
                    aValue = new Date(a.metadata.last_activity || a.metadata.last_updated)
                    bValue = new Date(b.metadata.last_activity || b.metadata.last_updated)
                    break
                default:
                    return 0
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
            return 0
        })

        return filtered
    }, [clients, searchTerm, statusFilter, entityFilter, sortField, sortDirection])

    // Calculate usage percentage
    const clientUsagePercentage = Math.round((subscriptionLimits.currentClients / subscriptionLimits.maxClients) * 100)
    const creditUsagePercentage = Math.round((subscriptionLimits.usedCredits / subscriptionLimits.aiCredits) * 100)

    // Check if near limits
    const isNearClientLimit = clientUsagePercentage >= 80
    const isAtClientLimit = subscriptionLimits.currentClients >= subscriptionLimits.maxClients
    const isNearCreditLimit = creditUsagePercentage >= 80

    const handleSort = (field: typeof sortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDirection('asc')
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    const getRelativeTime = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

        if (diffInHours < 24) {
            return `${diffInHours}h ago`
        } else if (diffInHours < 168) {
            return `${Math.floor(diffInHours / 24)}d ago`
        } else {
            return formatDate(dateString)
        }
    }

    const ClientCard = ({ client }: { client: Client }) => {
        const EntityIcon = ENTITY_TYPE_ICONS[client.entity_type]

        return (
            <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <EntityIcon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">{client.name}</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    {ENTITY_TYPE_LABELS[client.entity_type]}
                                </p>
                            </div>
                        </div>
                        <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>{client.status}</Badge>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="space-y-2 text-sm">
                        {client.metadata.email && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                <span>{client.metadata.email}</span>
                            </div>
                        )}
                        {client.metadata.phone && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="h-4 w-4" />
                                <span>{client.metadata.phone}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <FileText className="h-4 w-4" />
                            <span>{client.document_count} documents</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Added {formatDate(client.metadata.created_date)}</span>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" onClick={() => setSelectedClient(client)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                        </Button>
                        <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>
                                    {client.status === 'active' ? (
                                        <>
                                            <Archive className="h-4 w-4 mr-2" />
                                            Archive Client
                                        </>
                                    ) : (
                                        <>
                                            <ArchiveRestore className="h-4 w-4 mr-2" />
                                            Restore Client
                                        </>
                                    )}
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <FileText className="h-4 w-4 mr-2" />
                                    View Documents
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
                <p className="text-gray-600 mt-1">
                    Manage your clients, track subscription limits, and maintain professional relationships
                </p>
            </div>

            {/* Subscription Tier Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
                            <Crown className="h-4 w-4 text-yellow-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{subscriptionLimits.planName}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {subscriptionLimits.features.length} features included
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">Client Usage</CardTitle>
                            <Users className="h-4 w-4 text-blue-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {subscriptionLimits.currentClients} / {subscriptionLimits.maxClients}
                        </div>
                        <Progress value={clientUsagePercentage} className="mt-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                            {subscriptionLimits.maxClients - subscriptionLimits.currentClients} remaining
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">AI Credits</CardTitle>
                            <Zap className="h-4 w-4 text-purple-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {subscriptionLimits.usedCredits.toLocaleString()} /{' '}
                            {subscriptionLimits.aiCredits.toLocaleString()}
                        </div>
                        <Progress value={creditUsagePercentage} className="mt-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                            {(subscriptionLimits.aiCredits - subscriptionLimits.usedCredits).toLocaleString()} remaining
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Warnings */}
            {(isNearClientLimit || isNearCreditLimit) && (
                <div className="space-y-2">
                    {isAtClientLimit && (
                        <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                You've reached your client limit. Upgrade your plan to add more clients.
                                <Button variant="link" className="ml-2 p-0 h-auto">
                                    Upgrade Now
                                </Button>
                            </AlertDescription>
                        </Alert>
                    )}
                    {isNearClientLimit && !isAtClientLimit && (
                        <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                You're approaching your client limit ({clientUsagePercentage}% used). Consider upgrading
                                your plan soon.
                            </AlertDescription>
                        </Alert>
                    )}
                    {isNearCreditLimit && (
                        <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                You're running low on AI credits ({creditUsagePercentage}% used). Credits reset monthly
                                or upgrade for more.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            )}

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Search clients..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-80"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={entityFilter} onValueChange={(value: any) => setEntityFilter(value)}>
                            <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="Entity Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="individual">Individual</SelectItem>
                                <SelectItem value="corporation">Corporation</SelectItem>
                                <SelectItem value="partnership">Partnership</SelectItem>
                                <SelectItem value="llc">LLC</SelectItem>
                                <SelectItem value="nonprofit">Nonprofit</SelectItem>
                                <SelectItem value="trust">Trust</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="table">Table</SelectItem>
                            <SelectItem value="cards">Cards</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        onClick={() => setShowAddDialog(true)}
                        disabled={isAtClientLimit}
                        className="whitespace-nowrap"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Client
                        {isAtClientLimit && <AlertTriangle className="h-4 w-4 ml-2" />}
                    </Button>
                </div>
            </div>

            {/* Client List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : filteredAndSortedClients.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No clients found</h3>
                        <p className="text-gray-600 mb-4">
                            {searchTerm || statusFilter !== 'all' || entityFilter !== 'all'
                                ? 'Try adjusting your filters or search terms.'
                                : 'Get started by adding your first client.'}
                        </p>
                        {!isAtClientLimit && (
                            <Button onClick={() => setShowAddDialog(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Client
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : viewMode === 'table' ? (
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                                    <div className="flex items-center gap-2">
                                        Client
                                        <ArrowUpDown className="h-4 w-4" />
                                    </div>
                                </TableHead>
                                <TableHead>Entity Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Documents</TableHead>
                                <TableHead className="cursor-pointer" onClick={() => handleSort('created_date')}>
                                    <div className="flex items-center gap-2">
                                        Created
                                        <ArrowUpDown className="h-4 w-4" />
                                    </div>
                                </TableHead>
                                <TableHead className="cursor-pointer" onClick={() => handleSort('last_activity')}>
                                    <div className="flex items-center gap-2">
                                        Last Activity
                                        <ArrowUpDown className="h-4 w-4" />
                                    </div>
                                </TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAndSortedClients.map((client) => {
                                const EntityIcon = ENTITY_TYPE_ICONS[client.entity_type]
                                return (
                                    <TableRow key={client.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="p-1.5 bg-blue-50 rounded-md">
                                                    <EntityIcon className="h-4 w-4 text-blue-600" />
                                                </div>
                                                <div>
                                                    <div className="font-medium">{client.name}</div>
                                                    {client.metadata.tax_id && (
                                                        <div className="text-sm text-muted-foreground">
                                                            Tax ID: {client.metadata.tax_id}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{ENTITY_TYPE_LABELS[client.entity_type]}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                                                {client.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {client.metadata.email && (
                                                    <div className="flex items-center gap-1">
                                                        <Mail className="h-3 w-3" />
                                                        <span>{client.metadata.email}</span>
                                                    </div>
                                                )}
                                                {client.metadata.phone && (
                                                    <div className="flex items-center gap-1 text-muted-foreground">
                                                        <Phone className="h-3 w-3" />
                                                        <span>{client.metadata.phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                <span>{client.document_count}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{formatDate(client.metadata.created_date)}</TableCell>
                                        <TableCell>
                                            {getRelativeTime(
                                                client.metadata.last_activity || client.metadata.last_updated
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => setSelectedClient(client)}>
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Edit Client
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <FileText className="h-4 w-4 mr-2" />
                                                        View Documents
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        {client.status === 'active' ? (
                                                            <>
                                                                <Archive className="h-4 w-4 mr-2" />
                                                                Archive Client
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ArchiveRestore className="h-4 w-4 mr-2" />
                                                                Restore Client
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAndSortedClients.map((client) => (
                        <ClientCard key={client.id} client={client} />
                    ))}
                </div>
            )}

            {/* Client Details Dialog */}
            {selectedClient && (
                <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    {React.createElement(ENTITY_TYPE_ICONS[selectedClient.entity_type], {
                                        className: 'h-5 w-5 text-blue-600',
                                    })}
                                </div>
                                {selectedClient.name}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium">Entity Type</Label>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {ENTITY_TYPE_LABELS[selectedClient.entity_type]}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Status</Label>
                                    <div className="mt-1">
                                        <Badge variant={selectedClient.status === 'active' ? 'default' : 'secondary'}>
                                            {selectedClient.status}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {selectedClient.metadata.email && (
                                    <div>
                                        <Label className="text-sm font-medium">Email</Label>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {selectedClient.metadata.email}
                                        </p>
                                    </div>
                                )}
                                {selectedClient.metadata.phone && (
                                    <div>
                                        <Label className="text-sm font-medium">Phone</Label>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {selectedClient.metadata.phone}
                                        </p>
                                    </div>
                                )}
                                {selectedClient.metadata.tax_id && (
                                    <div>
                                        <Label className="text-sm font-medium">Tax ID</Label>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {selectedClient.metadata.tax_id}
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <Label className="text-sm font-medium">Documents</Label>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {selectedClient.document_count} documents
                                    </p>
                                </div>
                            </div>

                            {selectedClient.metadata.address && (
                                <div>
                                    <Label className="text-sm font-medium">Address</Label>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {selectedClient.metadata.address}
                                    </p>
                                </div>
                            )}

                            {selectedClient.metadata.notes && (
                                <div>
                                    <Label className="text-sm font-medium">Notes</Label>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {selectedClient.metadata.notes}
                                    </p>
                                </div>
                            )}

                            <Separator />

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <Label className="text-sm font-medium">Created</Label>
                                    <p className="text-muted-foreground mt-1">
                                        {formatDate(selectedClient.metadata.created_date)}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Last Activity</Label>
                                    <p className="text-muted-foreground mt-1">
                                        {getRelativeTime(
                                            selectedClient.metadata.last_activity ||
                                                selectedClient.metadata.last_updated
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setSelectedClient(null)}>
                                Close
                            </Button>
                            <Button>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Client
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}
