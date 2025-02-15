import Link from 'next/link'

import { MoreHorizontal } from 'lucide-react'

import { Workspace } from '@/types/workspaces'

import { WorkspaceCreateModal } from '@/components/workspaces/workspace-create-modal'
import { Badge } from '@/components/ui/badge'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const revalidate = 10

interface WorkspaceListProps {
    workspaces: Workspace[] | null | undefined
}

export function WorkspaceListV2({ workspaces = [] }: WorkspaceListProps) {
    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                    <Breadcrumb className="hidden md:flex">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link href="/dashboard">Dashboard</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>All Workspaces</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <Tabs defaultValue="all">
                        <div className="flex items-center">
                            <TabsList>
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="active">Active</TabsTrigger>
                                <TabsTrigger value="archived" className="hidden sm:flex">
                                    Archived
                                </TabsTrigger>
                            </TabsList>
                            <div className="ml-auto flex items-center gap-2">
                                <WorkspaceCreateModal />
                            </div>
                        </div>

                        <TabsContent value="all">
                            <Card x-chunk="dashboard-06-chunk-0">
                                <CardHeader>
                                    <CardTitle>Your Workspaces</CardTitle>
                                    <CardDescription>
                                        Manage your workspaces and invite team members to collaborate.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead className="hidden md:table-cell">Status</TableHead>
                                                <TableHead className="hidden md:table-cell">Creator</TableHead>
                                                <TableHead className="hidden md:table-cell">Id</TableHead>
                                                <TableHead>
                                                    <span className="sr-only">Actions</span>
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {workspaces &&
                                                Array.isArray(workspaces) &&
                                                workspaces.map((workspace) => (
                                                    <TableRow key={workspace.slug}>
                                                        <TableCell className="font-medium">
                                                            <Link href={`/dashboard/workspaces/${workspace.id}`}>
                                                                {workspace.name}
                                                            </Link>
                                                        </TableCell>
                                                        <TableCell className="hidden md:table-cell">
                                                            <Link href={`/dashboard/workspaces/${workspace.id}`}>
                                                                <Badge variant="outline">{workspace.status}</Badge>
                                                            </Link>
                                                        </TableCell>
                                                        <TableCell className="hidden md:table-cell">
                                                            {workspace.owner.email}
                                                        </TableCell>
                                                        <TableCell className="hidden md:table-cell">
                                                            <Link href={`/dashboard/workspaces/${workspace.id}`}>
                                                                {workspace.id}
                                                            </Link>
                                                        </TableCell>
                                                        <TableCell>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button
                                                                        aria-haspopup="true"
                                                                        size="icon"
                                                                        variant="ghost"
                                                                    >
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                        <span className="sr-only">Toggle menu</span>
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                    <DropdownMenuItem>
                                                                        <Link
                                                                            href={`/dashboard/workspaces/${workspace.id}`}
                                                                        >
                                                                            Home
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem>
                                                                        <Link
                                                                            href={`/dashboard/workspaces/${workspace.id}/details`}
                                                                        >
                                                                            Details
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                                <CardFooter>
                                    <div className="text-xs text-muted-foreground">Showing all workspaces</div>
                                </CardFooter>
                            </Card>
                        </TabsContent>
                        <TabsContent value="active">
                            <Card x-chunk="dashboard-06-chunk-0">
                                <CardHeader>
                                    <CardTitle>Your Workspaces</CardTitle>
                                    <CardDescription>
                                        Manage your workspaces and invite team members to collaborate.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead className="hidden md:table-cell">Status</TableHead>
                                                <TableHead className="hidden md:table-cell">Creator</TableHead>
                                                <TableHead className="hidden md:table-cell">Id</TableHead>
                                                <TableHead>
                                                    <span className="sr-only">Actions</span>
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {workspaces &&
                                                Array.isArray(workspaces) &&
                                                workspaces
                                                    .filter((workspace) => workspace.status === 'active') // Filter archived workspaces
                                                    .map((workspace) => (
                                                        <TableRow key={workspace.slug}>
                                                            <TableCell className="font-medium">
                                                                {workspace.name}
                                                            </TableCell>
                                                            <TableCell className="hidden md:table-cell">
                                                                <Badge variant="outline">{workspace.status}</Badge>
                                                            </TableCell>
                                                            <TableCell className="hidden md:table-cell">
                                                                {workspace.owner.email}
                                                            </TableCell>
                                                            <TableCell className="hidden md:table-cell">
                                                                {workspace.id}
                                                            </TableCell>
                                                            <TableCell>
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button
                                                                            aria-haspopup="true"
                                                                            size="icon"
                                                                            variant="ghost"
                                                                        >
                                                                            <MoreHorizontal className="h-4 w-4" />
                                                                            <span className="sr-only">Toggle menu</span>
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                        <DropdownMenuItem>
                                                                            <Link
                                                                                href={`/dashboard/workspaces/${workspace.id}`}
                                                                            >
                                                                                Home
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem>
                                                                            <Link
                                                                                href={`/dashboard/workspaces/${workspace.id}/details`}
                                                                            >
                                                                                Details
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                                <CardFooter>
                                    <div className="text-xs text-muted-foreground">Showing active workspaces</div>
                                </CardFooter>
                            </Card>
                        </TabsContent>
                        <TabsContent value="archived">
                            <Card x-chunk="dashboard-06-chunk-0">
                                <CardHeader>
                                    <CardTitle>Your Workspaces</CardTitle>
                                    <CardDescription>
                                        Manage your workspaces and invite team members to collaborate.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead className="hidden md:table-cell">Status</TableHead>
                                                <TableHead className="hidden md:table-cell">Creator</TableHead>

                                                <TableHead className="hidden md:table-cell">Id</TableHead>
                                                <TableHead>
                                                    <span className="sr-only">Actions</span>
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {workspaces &&
                                                Array.isArray(workspaces) &&
                                                workspaces
                                                    .filter((workspace) => workspace.status === 'archived') // Filter archived workspaces
                                                    .map((workspace) => (
                                                        <TableRow key={workspace.slug}>
                                                            <TableCell className="font-medium">
                                                                {workspace.name}
                                                            </TableCell>
                                                            <TableCell className="hidden md:table-cell">
                                                                <Badge variant="outline">{workspace.status}</Badge>
                                                            </TableCell>
                                                            <TableCell className="hidden md:table-cell">
                                                                {workspace.owner.email}
                                                            </TableCell>
                                                            <TableCell className="hidden md:table-cell">
                                                                {workspace.id}
                                                            </TableCell>
                                                            <TableCell>
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button
                                                                            aria-haspopup="true"
                                                                            size="icon"
                                                                            variant="ghost"
                                                                        >
                                                                            <MoreHorizontal className="h-4 w-4" />
                                                                            <span className="sr-only">Toggle menu</span>
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                        <DropdownMenuItem>
                                                                            <Link
                                                                                href={`/dashboard/workspaces/${workspace.id}`}
                                                                            >
                                                                                Home
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem>
                                                                            <Link
                                                                                href={`/dashboard/workspaces/${workspace.id}/details`}
                                                                            >
                                                                                Details
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                                <CardFooter>
                                    <div className="text-xs text-muted-foreground">Showing archived workspaces</div>
                                </CardFooter>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
