'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { 
    Search, 
    Plus, 
    Filter, 
    Edit, 
    FileText, 
    Users, 
    Building, 
    User,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    MoreHorizontal,
    Eye,
    Loader2,
    RefreshCw,
    AlertCircle,
    CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'

// TypeScript interfaces
interface Client {
    id: string
    name: string
    status: 'active' | 'inactive'
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
    }
}

interface ClientListResponse {
    clients: Client[]
    total: number
    page: number
    page_size: number
    total_pages: number
}

interface ClientFormData {
    name: string
    status: 'active' | 'inactive'
    entity_type: 'individual' | 'corporation' | 'partnership' | 'llc' | 'nonprofit' | 'trust'
    workspace: string
    email?: string
    phone?: string
    address?: string
    tax_id?: string
    notes?: string
}

interface ClientManagementProps {
    workspaceId: string
    onClientSelect?: (client: Client) => void
    onError?: (error: string) => void
}

type SortField = 'name' | 'status' | 'entity_type' | 'document_count' | 'created_date'
type SortDirection = 'asc' | 'desc'

const ENTITY_TYPE_LABELS = {
    individual: 'Individual',
    corporation: 'Corporation',
    partnership: 'Partnership',
    llc: 'LLC',
    nonprofit: 'Nonprofit',
    trust: 'Trust'
}

const STATUS_STYLES = {
    active: 'bg-green-100 text-green-800 border-green-200',
    inactive: 'bg-gray-100 text-gray-800 border-gray-200'
}

export const ClientManagement: React.FC<ClientManagementProps> = ({
    workspaceId,
    onClientSelect,
    onError
}) => {
    // State management
    const [clients, setClients] = useState<Client[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
    const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize] = useState(20)
    const [totalPages, setTotalPages] = useState(1)
    const [totalClients, setTotalClients] = useState(0)
    const [sortField, setSortField] = useState<SortField>('name')
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
    
    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editingClient, setEditingClient] = useState<Client | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form state
    const [formData, setFormData] = useState<ClientFormData>({
        name: '',
        status: 'active',
        entity_type: 'individual',
        workspace: workspaceId,
        email: '',
        phone: '',
        address: '',
        tax_id: '',
        notes: ''
    })

    // Fetch clients from API
    const fetchClients = useCallback(async (
        page = currentPage,
        search = searchTerm,
        statusFilter_local = statusFilter,
        entityFilter = entityTypeFilter,
        sort = sortField,
        direction = sortDirection
    ) => {
        setIsLoading(true)
        setError(null)

        try {
            const params = new URLSearchParams({
                workspace: workspaceId,
                page: page.toString(),
                page_size: pageSize.toString(),
                sort: sort,
                direction: direction
            })

            if (search) params.append('search', search)
            if (statusFilter_local !== 'all') params.append('status', statusFilter_local)
            if (entityFilter !== 'all') params.append('entity_type', entityFilter)

            const response = await fetch(`/api/clients/?${params}`)
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data: ClientListResponse = await response.json()
            
            setClients(data.clients)
            setTotalPages(data.total_pages)
            setTotalClients(data.total)
            setCurrentPage(data.page)

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load clients'
            setError(errorMessage)
            onError?.(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }, [workspaceId, currentPage, searchTerm, statusFilter, entityTypeFilter, sortField, sortDirection, pageSize, onError])

    // Create new client
    const createClient = async (clientData: ClientFormData) => {
        setIsSubmitting(true)
        try {
            const response = await fetch('/api/clients/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(clientData)
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            await fetchClients(1) // Refresh the list
            setIsAddModalOpen(false)
            resetForm()
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create client'
            setError(errorMessage)
            onError?.(errorMessage)
        } finally {
            setIsSubmitting(false)
        }
    }

    // Update existing client
    const updateClient = async (clientId: string, clientData: ClientFormData) => {
        setIsSubmitting(true)
        try {
            const response = await fetch(`/api/clients/${clientId}/`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(clientData)
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            await fetchClients() // Refresh the list
            setIsEditModalOpen(false)
            setEditingClient(null)
            resetForm()
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update client'
            setError(errorMessage)
            onError?.(errorMessage)
        } finally {
            setIsSubmitting(false)
        }
    }

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        
        if (editingClient) {
            updateClient(editingClient.id, formData)
        } else {
            createClient(formData)
        }
    }

    // Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            status: 'active',
            entity_type: 'individual',
            workspace: workspaceId,
            email: '',
            phone: '',
            address: '',
            tax_id: '',
            notes: ''
        })
    }

    // Handle edit client
    const handleEditClient = (client: Client) => {
        setEditingClient(client)
        setFormData({
            name: client.name,
            status: client.status,
            entity_type: client.entity_type,
            workspace: client.workspace,
            email: client.metadata.email || '',
            phone: client.metadata.phone || '',
            address: client.metadata.address || '',
            tax_id: client.metadata.tax_id || '',
            notes: client.metadata.notes || ''
        })
        setIsEditModalOpen(true)
    }

    // Handle sorting
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDirection('asc')
        }
    }

    // Get sort icon
    const getSortIcon = (field: SortField) => {
        if (sortField !== field) {
            return <ArrowUpDown className="w-4 h-4 text-gray-400" />
        }
        return sortDirection === 'asc' ? 
            <ArrowUp className="w-4 h-4 text-blue-600" /> : 
            <ArrowDown className="w-4 h-4 text-blue-600" />
    }

    // Get entity type icon
    const getEntityTypeIcon = (entityType: string) => {
        switch (entityType) {
            case 'individual':
                return <User className="w-4 h-4" />
            case 'corporation':
            case 'llc':
                return <Building className="w-4 h-4" />
            default:
                return <Users className="w-4 h-4" />
        }
    }

    // Debounced search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPage(1)
            fetchClients(1, searchTerm)
        }, 300)

        return () => clearTimeout(timer)
    }, [searchTerm, fetchClients])

    // Filter and sort effects
    useEffect(() => {
        setCurrentPage(1)
        fetchClients(1)
    }, [statusFilter, entityTypeFilter, sortField, sortDirection])

    // Initial load
    useEffect(() => {
        fetchClients()
    }, [fetchClients])

    // Pagination handlers
    const handlePreviousPage = () => {
        if (currentPage > 1) {
            const newPage = currentPage - 1
            setCurrentPage(newPage)
            fetchClients(newPage)
        }
    }

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            const newPage = currentPage + 1
            setCurrentPage(newPage)
            fetchClients(newPage)
        }
    }

    return (
        <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
                    <p className="text-gray-600 mt-1">
                        Manage clients and their tax document processing
                    </p>
                </div>
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="flex items-center space-x-2">
                            <Plus className="w-4 h-4" />
                            <span>Add Client</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Add New Client</DialogTitle>
                        </DialogHeader>
                        <ClientForm
                            formData={formData}
                            setFormData={setFormData}
                            onSubmit={handleSubmit}
                            isSubmitting={isSubmitting}
                            onCancel={() => {
                                setIsAddModalOpen(false)
                                resetForm()
                            }}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Error Alert */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {error}
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => fetchClients()}
                            className="ml-4"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Retry
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Clients</p>
                                <p className="text-2xl font-bold">{totalClients}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Active Clients</p>
                                <p className="text-2xl font-bold">
                                    {clients.filter(c => c.status === 'active').length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <FileText className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Documents</p>
                                <p className="text-2xl font-bold">
                                    {clients.reduce((sum, client) => sum + client.document_count, 0)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Search */}
            <Card>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search clients..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by entity type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Entity Types</SelectItem>
                                {Object.entries(ENTITY_TYPE_LABELS).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>{label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex items-center text-sm text-gray-600">
                            <Filter className="w-4 h-4 mr-2" />
                            {clients.length} of {totalClients} clients
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Client Table */}
            <Card>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center p-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            <span className="ml-2 text-gray-600">Loading clients...</span>
                        </div>
                    ) : clients.length === 0 ? (
                        <div className="text-center p-12">
                            <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
                            <p className="text-gray-600">
                                {searchTerm || statusFilter !== 'all' || entityTypeFilter !== 'all' 
                                    ? 'Try adjusting your filters or search term.' 
                                    : 'Get started by adding your first client.'}
                            </p>
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            <Button
                                                variant="ghost"
                                                className="h-auto p-0 font-medium"
                                                onClick={() => handleSort('name')}
                                            >
                                                Client Name
                                                {getSortIcon('name')}
                                            </Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button
                                                variant="ghost"
                                                className="h-auto p-0 font-medium"
                                                onClick={() => handleSort('entity_type')}
                                            >
                                                Entity Type
                                                {getSortIcon('entity_type')}
                                            </Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button
                                                variant="ghost"
                                                className="h-auto p-0 font-medium"
                                                onClick={() => handleSort('status')}
                                            >
                                                Status
                                                {getSortIcon('status')}
                                            </Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button
                                                variant="ghost"
                                                className="h-auto p-0 font-medium"
                                                onClick={() => handleSort('document_count')}
                                            >
                                                Documents
                                                {getSortIcon('document_count')}
                                            </Button>
                                        </TableHead>
                                        <TableHead>Contact Info</TableHead>
                                        <TableHead>
                                            <Button
                                                variant="ghost"
                                                className="h-auto p-0 font-medium"
                                                onClick={() => handleSort('created_date')}
                                            >
                                                Created
                                                {getSortIcon('created_date')}
                                            </Button>
                                        </TableHead>
                                        <TableHead className="w-[50px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {clients.map((client) => (
                                        <TableRow key={client.id} className="hover:bg-gray-50">
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium text-gray-900">{client.name}</p>
                                                    <p className="text-sm text-gray-500">ID: {client.id}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    {getEntityTypeIcon(client.entity_type)}
                                                    <span>{ENTITY_TYPE_LABELS[client.entity_type]}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge 
                                                    variant="outline" 
                                                    className={STATUS_STYLES[client.status]}
                                                >
                                                    {client.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <FileText className="w-4 h-4 text-gray-400" />
                                                    <span>{client.document_count}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {client.metadata.email && (
                                                        <p className="text-gray-900">{client.metadata.email}</p>
                                                    )}
                                                    {client.metadata.phone && (
                                                        <p className="text-gray-500">{client.metadata.phone}</p>
                                                    )}
                                                    {!client.metadata.email && !client.metadata.phone && (
                                                        <span className="text-gray-400">No contact info</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-500">
                                                {new Date(client.metadata.created_date).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => onClientSelect?.(client)}>
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleEditClient(client)}>
                                                            <Edit className="w-4 h-4 mr-2" />
                                                            Edit Client
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-6 py-4 border-t">
                                    <div className="text-sm text-gray-600">
                                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalClients)} of {totalClients} clients
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handlePreviousPage}
                                            disabled={currentPage === 1}
                                        >
                                            Previous
                                        </Button>
                                        <span className="text-sm text-gray-600">
                                            Page {currentPage} of {totalPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleNextPage}
                                            disabled={currentPage === totalPages}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Edit Client Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Client</DialogTitle>
                    </DialogHeader>
                    <ClientForm
                        formData={formData}
                        setFormData={setFormData}
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                        isEditing={true}
                        onCancel={() => {
                            setIsEditModalOpen(false)
                            setEditingClient(null)
                            resetForm()
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    )
}

// Client Form Component
interface ClientFormProps {
    formData: ClientFormData
    setFormData: (data: ClientFormData) => void
    onSubmit: (e: React.FormEvent) => void
    isSubmitting: boolean
    isEditing?: boolean
    onCancel: () => void
}

const ClientForm: React.FC<ClientFormProps> = ({
    formData,
    setFormData,
    onSubmit,
    isSubmitting,
    isEditing = false,
    onCancel
}) => {
    const updateFormData = (field: keyof ClientFormData, value: string) => {
        setFormData({ ...formData, [field]: value })
    }

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <ScrollArea className="h-96">
                <div className="space-y-4 pr-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="name">Client Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => updateFormData('name', e.target.value)}
                                required
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="entity_type">Entity Type *</Label>
                            <Select 
                                value={formData.entity_type} 
                                onValueChange={(value: any) => updateFormData('entity_type', value)}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(ENTITY_TYPE_LABELS).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="status">Status</Label>
                            <Select 
                                value={formData.status} 
                                onValueChange={(value: any) => updateFormData('status', value)}
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="tax_id">Tax ID / SSN</Label>
                            <Input
                                id="tax_id"
                                value={formData.tax_id}
                                onChange={(e) => updateFormData('tax_id', e.target.value)}
                                className="mt-1"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => updateFormData('email', e.target.value)}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => updateFormData('phone', e.target.value)}
                                className="mt-1"
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                            id="address"
                            value={formData.address}
                            onChange={(e) => updateFormData('address', e.target.value)}
                            rows={2}
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => updateFormData('notes', e.target.value)}
                            rows={3}
                            className="mt-1"
                            placeholder="Additional notes about this client..."
                        />
                    </div>
                </div>
            </ScrollArea>

            <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || !formData.name}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {isEditing ? 'Updating...' : 'Creating...'}
                        </>
                    ) : (
                        isEditing ? 'Update Client' : 'Create Client'
                    )}
                </Button>
            </div>
        </form>
    )
}
