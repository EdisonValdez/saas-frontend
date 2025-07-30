'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
    Plus, 
    Upload, 
    FileText, 
    Users, 
    Clock, 
    CheckCircle2, 
    AlertTriangle, 
    TrendingUp, 
    TrendingDown,
    Eye,
    MoreHorizontal,
    RefreshCw,
    AlertCircle,
    Loader2,
    Activity,
    BarChart3,
    PieChart,
    Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Area,
    AreaChart
} from 'recharts'

// TypeScript interfaces
interface DashboardMetrics {
    total_documents: number
    processed_forms: number
    pending_tasks: number
    active_clients: number
    documents_today: number
    processing_accuracy: number
    avg_processing_time: number
    completed_today: number
    trends: {
        documents: number // percentage change
        processing: number
        clients: number
    }
}

interface RecentActivity {
    id: string
    type: 'document_uploaded' | 'extraction_completed' | 'client_added' | 'form_processed' | 'validation_error'
    title: string
    description: string
    timestamp: string
    client_name?: string
    document_type?: string
    status: 'success' | 'warning' | 'error' | 'info'
}

interface DashboardAlert {
    id: string
    type: 'error' | 'warning' | 'info'
    title: string
    description: string
    count: number
    action_required: boolean
    priority: 'high' | 'medium' | 'low'
    created_at: string
}

interface ChartData {
    form_types: Array<{
        name: string
        count: number
        percentage: number
        color: string
    }>
    processing_status: Array<{
        name: string
        count: number
        color: string
    }>
    weekly_activity: Array<{
        day: string
        documents: number
        processed: number
        errors: number
    }>
}

interface DashboardOverviewProps {
    workspaceId: string
    onUploadDocument?: () => void
    onAddClient?: () => void
    onProcessForms?: () => void
    onViewActivity?: (activity: RecentActivity) => void
    onError?: (error: string) => void
}

// Chart colors
const CHART_COLORS = {
    primary: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#8B5CF6',
    gray: '#6B7280'
}

const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280']

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
    workspaceId,
    onUploadDocument,
    onAddClient,
    onProcessForms,
    onViewActivity,
    onError
}) => {
    // State management
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
    const [alerts, setAlerts] = useState<DashboardAlert[]>([])
    const [chartData, setChartData] = useState<ChartData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

    // Fetch dashboard data
    const fetchDashboardData = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            const [metricsRes, activityRes, alertsRes] = await Promise.all([
                fetch(`/api/dashboard/metrics/?workspace=${workspaceId}`),
                fetch(`/api/dashboard/recent-activity/?workspace=${workspaceId}`),
                fetch(`/api/dashboard/alerts/?workspace=${workspaceId}`)
            ])

            if (!metricsRes.ok || !activityRes.ok || !alertsRes.ok) {
                throw new Error('Failed to fetch dashboard data')
            }

            const [metricsData, activityData, alertsData] = await Promise.all([
                metricsRes.json(),
                activityRes.json(),
                alertsRes.json()
            ])

            setMetrics(metricsData.metrics)
            setRecentActivity(activityData.activities)
            setAlerts(alertsData.alerts)
            setChartData(metricsData.charts)
            setLastRefresh(new Date())

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load dashboard data'
            setError(errorMessage)
            onError?.(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }, [workspaceId, onError])

    // Auto-refresh every 5 minutes
    useEffect(() => {
        fetchDashboardData()
        
        const interval = setInterval(() => {
            fetchDashboardData()
        }, 5 * 60 * 1000) // 5 minutes

        return () => clearInterval(interval)
    }, [fetchDashboardData])

    // Get trend icon and color
    const getTrendDisplay = (trend: number) => {
        if (trend > 0) {
            return {
                icon: <TrendingUp className="w-4 h-4 text-green-600" />,
                color: 'text-green-600',
                text: `+${trend}%`
            }
        } else if (trend < 0) {
            return {
                icon: <TrendingDown className="w-4 h-4 text-red-600" />,
                color: 'text-red-600',
                text: `${trend}%`
            }
        } else {
            return {
                icon: <div className="w-4 h-4" />,
                color: 'text-gray-500',
                text: '0%'
            }
        }
    }

    // Get activity icon
    const getActivityIcon = (type: RecentActivity['type']) => {
        switch (type) {
            case 'document_uploaded':
                return <Upload className="w-4 h-4 text-blue-500" />
            case 'extraction_completed':
                return <CheckCircle2 className="w-4 h-4 text-green-500" />
            case 'client_added':
                return <Users className="w-4 h-4 text-purple-500" />
            case 'form_processed':
                return <FileText className="w-4 h-4 text-blue-500" />
            case 'validation_error':
                return <AlertTriangle className="w-4 h-4 text-red-500" />
            default:
                return <Activity className="w-4 h-4 text-gray-500" />
        }
    }

    // Get alert styling
    const getAlertStyling = (type: DashboardAlert['type'], priority: DashboardAlert['priority']) => {
        const baseClasses = 'border-l-4 bg-opacity-10'
        
        if (type === 'error') {
            return `${baseClasses} border-red-500 bg-red-50`
        } else if (type === 'warning') {
            return `${baseClasses} border-yellow-500 bg-yellow-50`
        } else {
            return `${baseClasses} border-blue-500 bg-blue-50`
        }
    }

    // Format time ago
    const formatTimeAgo = (timestamp: string): string => {
        const now = new Date()
        const time = new Date(timestamp)
        const diffMs = now.getTime() - time.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMins / 60)
        const diffDays = Math.floor(diffHours / 24)

        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`
        return time.toLocaleDateString()
    }

    if (isLoading && !metrics) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    if (error && !metrics) {
        return (
            <div className="p-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {error}
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={fetchDashboardData}
                            className="ml-4"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Retry
                        </Button>
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600 mt-1">
                        Tax form management system overview
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="text-sm text-gray-500">
                        Last updated: {lastRefresh.toLocaleTimeString()}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchDashboardData}
                        disabled={isLoading}
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Plus className="w-5 h-5" />
                        <span>Quick Actions</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button
                            onClick={onUploadDocument}
                            className="h-auto p-4 flex-col space-y-2"
                            variant="outline"
                        >
                            <Upload className="w-6 h-6" />
                            <span>Upload Document</span>
                            <span className="text-xs text-gray-500">Add new tax forms</span>
                        </Button>
                        <Button
                            onClick={onAddClient}
                            className="h-auto p-4 flex-col space-y-2"
                            variant="outline"
                        >
                            <Users className="w-6 h-6" />
                            <span>Add Client</span>
                            <span className="text-xs text-gray-500">Create new client profile</span>
                        </Button>
                        <Button
                            onClick={onProcessForms}
                            className="h-auto p-4 flex-col space-y-2"
                            variant="outline"
                        >
                            <FileText className="w-6 h-6" />
                            <span>Process Forms</span>
                            <span className="text-xs text-gray-500">Run batch processing</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Key Metrics */}
            {metrics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Documents</p>
                                    <p className="text-3xl font-bold text-gray-900">{metrics.total_documents.toLocaleString()}</p>
                                    <div className="flex items-center mt-2">
                                        {getTrendDisplay(metrics.trends.documents).icon}
                                        <span className={`text-sm ${getTrendDisplay(metrics.trends.documents).color}`}>
                                            {getTrendDisplay(metrics.trends.documents).text}
                                        </span>
                                        <span className="text-sm text-gray-500 ml-1">vs last period</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <FileText className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Processed Forms</p>
                                    <p className="text-3xl font-bold text-gray-900">{metrics.processed_forms.toLocaleString()}</p>
                                    <div className="flex items-center mt-2">
                                        {getTrendDisplay(metrics.trends.processing).icon}
                                        <span className={`text-sm ${getTrendDisplay(metrics.trends.processing).color}`}>
                                            {getTrendDisplay(metrics.trends.processing).text}
                                        </span>
                                        <span className="text-sm text-gray-500 ml-1">vs last period</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Active Clients</p>
                                    <p className="text-3xl font-bold text-gray-900">{metrics.active_clients.toLocaleString()}</p>
                                    <div className="flex items-center mt-2">
                                        {getTrendDisplay(metrics.trends.clients).icon}
                                        <span className={`text-sm ${getTrendDisplay(metrics.trends.clients).color}`}>
                                            {getTrendDisplay(metrics.trends.clients).text}
                                        </span>
                                        <span className="text-sm text-gray-500 ml-1">vs last period</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <Users className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Pending Tasks</p>
                                    <p className="text-3xl font-bold text-gray-900">{metrics.pending_tasks.toLocaleString()}</p>
                                    <div className="flex items-center mt-2">
                                        <Clock className="w-4 h-4 text-orange-500" />
                                        <span className="text-sm text-orange-600 ml-1">
                                            Requires attention
                                        </span>
                                    </div>
                                </div>
                                <div className="p-3 bg-orange-100 rounded-lg">
                                    <Clock className="w-6 h-6 text-orange-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Performance Metrics */}
            {metrics && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Processing Accuracy</h3>
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                    {metrics.processing_accuracy}%
                                </Badge>
                            </div>
                            <Progress value={metrics.processing_accuracy} className="h-2" />
                            <p className="text-sm text-gray-600 mt-2">
                                Above 95% is excellent
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Avg Processing Time</h3>
                                <Badge variant="outline">
                                    {metrics.avg_processing_time}min
                                </Badge>
                            </div>
                            <div className="text-2xl font-bold text-gray-900 mb-2">
                                {metrics.avg_processing_time} minutes
                            </div>
                            <p className="text-sm text-gray-600">
                                Per document average
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Today's Activity</h3>
                                <Badge variant="outline" className="text-blue-600 border-blue-600">
                                    {metrics.documents_today + metrics.completed_today}
                                </Badge>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Uploaded</span>
                                    <span className="font-medium">{metrics.documents_today}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Completed</span>
                                    <span className="font-medium">{metrics.completed_today}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Charts */}
                {chartData && (
                    <>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <BarChart3 className="w-5 h-5" />
                                    <span>Form Types Distribution</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={chartData.form_types}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="count" fill={CHART_COLORS.primary} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <PieChart className="w-5 h-5" />
                                    <span>Processing Status</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <RechartsPieChart>
                                        <Pie
                                            data={chartData.processing_status}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            dataKey="count"
                                            label={({ name, percentage }) => `${name} ${percentage}%`}
                                        >
                                            {chartData.processing_status.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </RechartsPieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Activity className="w-5 h-5" />
                                    <span>Weekly Activity Trend</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={chartData.weekly_activity}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="day" />
                                        <YAxis />
                                        <Tooltip />
                                        <Area 
                                            type="monotone" 
                                            dataKey="documents" 
                                            stackId="1"
                                            stroke={CHART_COLORS.primary} 
                                            fill={CHART_COLORS.primary}
                                            fillOpacity={0.6}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="processed" 
                                            stackId="2"
                                            stroke={CHART_COLORS.success} 
                                            fill={CHART_COLORS.success}
                                            fillOpacity={0.6}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Activity className="w-5 h-5" />
                            <span>Recent Activity</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-80">
                            <div className="space-y-4">
                                {recentActivity.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        No recent activity
                                    </div>
                                ) : (
                                    recentActivity.map((activity) => (
                                        <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                                             onClick={() => onViewActivity?.(activity)}>
                                            <div className="flex-shrink-0 mt-1">
                                                {getActivityIcon(activity.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {activity.title}
                                                </p>
                                                <p className="text-sm text-gray-600 truncate">
                                                    {activity.description}
                                                </p>
                                                <div className="flex items-center mt-1 space-x-2">
                                                    {activity.client_name && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            {activity.client_name}
                                                        </Badge>
                                                    )}
                                                    {activity.document_type && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {activity.document_type}
                                                        </Badge>
                                                    )}
                                                    <span className="text-xs text-gray-500">
                                                        {formatTimeAgo(activity.timestamp)}
                                                    </span>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => onViewActivity?.(activity)}>
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Alerts */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <AlertTriangle className="w-5 h-5" />
                                <span>Alerts & Notifications</span>
                            </div>
                            {alerts.length > 0 && (
                                <Badge variant="destructive">
                                    {alerts.filter(a => a.action_required).length}
                                </Badge>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-80">
                            <div className="space-y-4">
                                {alerts.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                                        No alerts - all systems running smoothly
                                    </div>
                                ) : (
                                    alerts.map((alert) => (
                                        <div key={alert.id} className={`p-4 rounded-lg ${getAlertStyling(alert.type, alert.priority)}`}>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <h4 className="text-sm font-medium text-gray-900">
                                                            {alert.title}
                                                        </h4>
                                                        {alert.count > 1 && (
                                                            <Badge variant="outline" className="text-xs">
                                                                {alert.count}
                                                            </Badge>
                                                        )}
                                                        <Badge 
                                                            variant={alert.priority === 'high' ? 'destructive' : 'secondary'}
                                                            className="text-xs"
                                                        >
                                                            {alert.priority}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-gray-700 mb-2">
                                                        {alert.description}
                                                    </p>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-gray-500">
                                                            {formatTimeAgo(alert.created_at)}
                                                        </span>
                                                        {alert.action_required && (
                                                            <Button size="sm" variant="outline">
                                                                Take Action
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
