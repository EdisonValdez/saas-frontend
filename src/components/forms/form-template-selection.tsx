'use client'

import { useState, useMemo } from 'react'
import { Search, Filter, Grid, List, Calendar, Tag, Clock, User, RefreshCw, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
    useTaxFormTemplates,
    useSearchTaxFormTemplates,
    useTaxFormTemplatesByYear,
    useTaxFormTemplatesByCategory,
    useSyncFromFilesystem
} from '@/hooks/use-tax-form-templates'
import { useTaxFormTemplates as useBackendTemplates } from '@/hooks/use-tax-forms-backend'
import { convertBackendToOriginal } from '@/lib/api/tax-forms-compatibility'
import type { TaxFormTemplate, TaxFormTemplateFilters } from '@/types/tax-forms'
import type { TaxFormTemplate as BackendTemplate } from '@/types/tax-forms-backend'
import { cn } from '@/lib/utils'

interface FormTemplateSelectionProps {
    onSelectTemplate: (template: TaxFormTemplate) => void
    selectedTemplateId?: string
    workspaceId?: string
    className?: string
}

export default function FormTemplateSelection({
    onSelectTemplate,
    selectedTemplateId,
    workspaceId,
    className
}: FormTemplateSelectionProps) {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [searchQuery, setSearchQuery] = useState('')
    const [filters, setFilters] = useState<TaxFormTemplateFilters>({
        tax_year: new Date().getFullYear(),
        page_size: 20,
    })
    const [showFilters, setShowFilters] = useState(false)

    // API calls
    const { data: templates, isLoading, error, refetch } = useTaxFormTemplates(filters)
    const { data: searchResults, isLoading: isSearching } = useSearchTaxFormTemplates(
        searchQuery, 
        { tax_year: filters.tax_year, category: filters.category }
    )
    const syncMutation = useSyncFromFilesystem()

    // Determine which data to show
    const displayTemplates = searchQuery ? searchResults : templates?.results
    const isLoadingData = searchQuery ? isSearching : isLoading

    // Filter options
    const categories = useMemo(() => [
        'Individual', 'Business', 'Partnership', 'Corporation', 'Estate', 'Trust', 'Nonprofit'
    ], [])

    const complexityLevels = useMemo(() => [
        { value: 'simple', label: 'Simple', color: 'bg-green-100 text-green-800' },
        { value: 'intermediate', label: 'Intermediate', color: 'bg-yellow-100 text-yellow-800' },
        { value: 'complex', label: 'Complex', color: 'bg-red-100 text-red-800' },
    ], [])

    const taxYears = useMemo(() => {
        const currentYear = new Date().getFullYear()
        return Array.from({ length: 5 }, (_, i) => currentYear - i)
    }, [])

    const handleFilterChange = (key: keyof TaxFormTemplateFilters, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value === 'all' ? undefined : value,
            page: 1, // Reset to first page when filtering
        }))
    }

    const handleSync = () => {
        syncMutation.mutate({
            tax_year: filters.tax_year,
            force_update: false,
        })
    }

    const getComplexityBadge = (complexity: string) => {
        const config = complexityLevels.find(level => level.value === complexity)
        return config || { value: complexity, label: complexity, color: 'bg-gray-100 text-gray-800' }
    }

    const formatEstimatedTime = (minutes: number) => {
        if (minutes < 60) return `${minutes} min`
        const hours = Math.floor(minutes / 60)
        const remainingMinutes = minutes % 60
        return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
    }

    const TemplateCard = ({ template }: { template: TaxFormTemplate }) => {
        const complexity = getComplexityBadge(template.complexity)
        const isSelected = selectedTemplateId === template.id

        return (
            <Card 
                className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-md",
                    isSelected && "ring-2 ring-primary border-primary",
                    "h-full"
                )}
                onClick={() => onSelectTemplate(template)}
            >
                <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="text-lg font-semibold text-gray-900">
                                {template.form_number}
                            </CardTitle>
                            <CardDescription className="text-sm text-gray-600 mt-1">
                                {template.name}
                            </CardDescription>
                        </div>
                        <Badge className={complexity.color}>
                            {complexity.label}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="space-y-3">
                        <p className="text-sm text-gray-600 line-clamp-2">
                            {template.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {template.tax_year}
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatEstimatedTime(template.estimated_time)}
                            </div>
                            <div className="flex items-center gap-1">
                                <Tag className="h-3 w-3" />
                                {template.category}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-1">
                                {template.filing_status?.slice(0, 2).map(status => (
                                    <Badge key={status} variant="secondary" className="text-xs">
                                        {status}
                                    </Badge>
                                ))}
                                {template.filing_status && template.filing_status.length > 2 && (
                                    <Badge variant="secondary" className="text-xs">
                                        +{template.filing_status.length - 2}
                                    </Badge>
                                )}
                            </div>
                            <div className="text-xs text-gray-500">
                                v{template.version}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const TemplateListItem = ({ template }: { template: TaxFormTemplate }) => {
        const complexity = getComplexityBadge(template.complexity)
        const isSelected = selectedTemplateId === template.id

        return (
            <Card 
                className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-sm",
                    isSelected && "ring-2 ring-primary border-primary"
                )}
                onClick={() => onSelectTemplate(template)}
            >
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                                <div>
                                    <h3 className="font-semibold text-gray-900">{template.form_number}</h3>
                                    <p className="text-sm text-gray-600 mt-1">{template.name}</p>
                                </div>
                                <Badge className={complexity.color}>
                                    {complexity.label}
                                </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-2 line-clamp-1">
                                {template.description}
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {template.tax_year}
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {formatEstimatedTime(template.estimated_time)}
                            </div>
                            <div className="flex items-center gap-1">
                                <Tag className="h-4 w-4" />
                                {template.category}
                            </div>
                            <div className="text-xs">
                                v{template.version}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const LoadingSkeleton = () => (
        <div className={cn(
            viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                : "space-y-4"
        )}>
            {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-48" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-16 w-full mb-4" />
                        <div className="flex gap-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )

    return (
        <div className={cn("space-y-6", className)}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Tax Form Templates</h2>
                    <p className="text-gray-600">
                        Choose a template to start generating your tax form
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSync}
                        disabled={syncMutation.isPending}
                    >
                        <RefreshCw className={cn("h-4 w-4 mr-2", syncMutation.isPending && "animate-spin")} />
                        Sync Templates
                    </Button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                
                <Sheet open={showFilters} onOpenChange={setShowFilters}>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Filter className="h-4 w-4 mr-2" />
                            Filters
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Filter Templates</SheetTitle>
                            <SheetDescription>
                                Narrow down templates by your criteria
                            </SheetDescription>
                        </SheetHeader>
                        
                        <div className="space-y-6 mt-6">
                            <div>
                                <Label htmlFor="tax-year">Tax Year</Label>
                                <Select value={filters.tax_year?.toString()} onValueChange={(value) => handleFilterChange('tax_year', parseInt(value))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select tax year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {taxYears.map(year => (
                                            <SelectItem key={year} value={year.toString()}>
                                                {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="category">Category</Label>
                                <Select value={filters.category || 'all'} onValueChange={(value) => handleFilterChange('category', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {categories.map(category => (
                                            <SelectItem key={category} value={category}>
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="complexity">Complexity</Label>
                                <Select value={filters.complexity || 'all'} onValueChange={(value) => handleFilterChange('complexity', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select complexity" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Levels</SelectItem>
                                        {complexityLevels.map(level => (
                                            <SelectItem key={level.value} value={level.value}>
                                                {level.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>

                <div className="flex items-center border rounded-lg">
                    <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="rounded-r-none"
                    >
                        <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="rounded-l-none"
                    >
                        <List className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Results */}
            <div>
                {error && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="p-4">
                            <p className="text-red-800">
                                Failed to load templates. Please try again.
                            </p>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => refetch()}
                                className="mt-2"
                            >
                                Retry
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {isLoadingData && <LoadingSkeleton />}

                {!isLoadingData && displayTemplates && displayTemplates.length === 0 && (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <p className="text-gray-600">
                                {searchQuery ? 'No templates found matching your search.' : 'No templates available.'}
                            </p>
                            {searchQuery && (
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setSearchQuery('')}
                                    className="mt-2"
                                >
                                    Clear Search
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}

                {!isLoadingData && displayTemplates && displayTemplates.length > 0 && (
                    <div className={cn(
                        viewMode === 'grid' 
                            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                            : "space-y-4"
                    )}>
                        {displayTemplates.map(template => 
                            viewMode === 'grid' ? (
                                <TemplateCard key={template.id} template={template} />
                            ) : (
                                <TemplateListItem key={template.id} template={template} />
                            )
                        )}
                    </div>
                )}

                {/* Pagination would go here if needed */}
                {templates && templates.count > (filters.page_size || 20) && (
                    <div className="flex justify-center mt-6">
                        <Button variant="outline">
                            Load More Templates
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
