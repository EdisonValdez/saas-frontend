import Link from 'next/link'
import { MoreHorizontal, Calculator, FileText } from 'lucide-react'

import { TaxAssistantSession } from '@/types/agents'
import { TaxAssistantCreateModal } from '@/components/agents/tax-assistant-create-modal'
import { Badge } from '@/components/ui/badge'
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

interface TaxAssistantListProps {
    workspaceId: string
    taxAssistantSessions: TaxAssistantSession[] | null | undefined
}

export function TaxAssistantSessionsList({ workspaceId, taxAssistantSessions = [] }: TaxAssistantListProps) {
    const hasSessions = taxAssistantSessions && Array.isArray(taxAssistantSessions) && taxAssistantSessions.length > 0

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40 pt-4">
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center gap-2">
                            <Calculator className="h-6 w-6 text-blue-600" />
                            <h1 className="text-2xl font-bold">Tax Assistant Sessions</h1>
                        </div>
                    </div>

                    <Tabs defaultValue="active">
                        <div className="flex items-center">
                            {hasSessions && (
                                <TabsList>
                                    <TabsTrigger value="all">All</TabsTrigger>
                                    <TabsTrigger value="active">Active</TabsTrigger>
                                    <TabsTrigger value="archived" className="hidden sm:flex">
                                        Archived
                                    </TabsTrigger>
                                </TabsList>
                            )}
                            {!hasSessions && (
                                <div className="text-lg font-medium text-muted-foreground">No tax assistant sessions found</div>
                            )}
                            <div className="ml-auto flex items-center gap-2">
                                <TaxAssistantCreateModal workspaceId={workspaceId} />
                            </div>
                        </div>

                        {hasSessions && (
                            <>
                                <TabsContent value="all">
                                    <Card x-chunk="tax-assistant-01">
                                        <CardHeader>
                                            <CardTitle>Your Tax Assistant Sessions</CardTitle>
                                            <CardDescription>Manage your tax consultation sessions with AI assistance.</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Name</TableHead>
                                                        <TableHead>Client</TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead className="hidden md:table-cell">Created</TableHead>
                                                        <TableHead>
                                                            <span className="sr-only">Actions</span>
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {taxAssistantSessions.map((session) => (
                                                        <TableRow key={session.id}>
                                                            <TableCell className="font-medium">
                                                                <Link
                                                                    href={`/dashboard/workspaces/${workspaceId}/tax-assistant/${session.id}/`}
                                                                    className="flex items-center gap-2 hover:text-blue-600"
                                                                >
                                                                    <FileText className="h-4 w-4" />
                                                                    {session.name}
                                                                </Link>
                                                            </TableCell>
                                                            <TableCell>
                                                                {session.client_name ? (
                                                                    <Badge variant="secondary">{session.client_name}</Badge>
                                                                ) : (
                                                                    <span className="text-muted-foreground">No client</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge 
                                                                    variant={session.status === 'active' ? 'default' : 'outline'}
                                                                >
                                                                    {session.status}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="hidden md:table-cell">
                                                                {new Date(session.created_at).toLocaleDateString()}
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
                                                                                href={`/dashboard/workspaces/${workspaceId}/tax-assistant/${session.id}/`}
                                                                            >
                                                                                View Session
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem>
                                                                            Archive Session
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
                                            <div className="text-xs text-muted-foreground">
                                                Showing all tax assistant sessions
                                            </div>
                                        </CardFooter>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="active">
                                    <Card x-chunk="tax-assistant-02">
                                        <CardHeader>
                                            <CardTitle>Active Tax Sessions</CardTitle>
                                            <CardDescription>Currently active tax consultation sessions.</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Name</TableHead>
                                                        <TableHead>Client</TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead className="hidden md:table-cell">Created</TableHead>
                                                        <TableHead>
                                                            <span className="sr-only">Actions</span>
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {taxAssistantSessions
                                                        .filter((session) => session.status === 'active')
                                                        .map((session) => (
                                                            <TableRow key={session.id}>
                                                                <TableCell className="font-medium">
                                                                    <Link
                                                                        href={`/dashboard/workspaces/${workspaceId}/tax-assistant/${session.id}/`}
                                                                        className="flex items-center gap-2 hover:text-blue-600"
                                                                    >
                                                                        <FileText className="h-4 w-4" />
                                                                        {session.name}
                                                                    </Link>
                                                                </TableCell>
                                                                <TableCell>
                                                                    {session.client_name ? (
                                                                        <Badge variant="secondary">{session.client_name}</Badge>
                                                                    ) : (
                                                                        <span className="text-muted-foreground">No client</span>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge variant="default">{session.status}</Badge>
                                                                </TableCell>
                                                                <TableCell className="hidden md:table-cell">
                                                                    {new Date(session.created_at).toLocaleDateString()}
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
                                                                                    href={`/dashboard/workspaces/${workspaceId}/tax-assistant/${session.id}/`}
                                                                                >
                                                                                    View Session
                                                                                </Link>
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem>
                                                                                Complete Session
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
                                            <div className="text-xs text-muted-foreground">Showing active sessions</div>
                                        </CardFooter>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="archived">
                                    <Card x-chunk="tax-assistant-03">
                                        <CardHeader>
                                            <CardTitle>Archived Tax Sessions</CardTitle>
                                            <CardDescription>Previously archived tax consultation sessions.</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Name</TableHead>
                                                        <TableHead>Client</TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead className="hidden md:table-cell">Created</TableHead>
                                                        <TableHead>
                                                            <span className="sr-only">Actions</span>
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {taxAssistantSessions
                                                        .filter((session) => session.status === 'archived')
                                                        .map((session) => (
                                                            <TableRow key={session.id}>
                                                                <TableCell className="font-medium">
                                                                    <Link
                                                                        href={`/dashboard/workspaces/${workspaceId}/tax-assistant/${session.id}/`}
                                                                        className="flex items-center gap-2 hover:text-blue-600"
                                                                    >
                                                                        <FileText className="h-4 w-4" />
                                                                        {session.name}
                                                                    </Link>
                                                                </TableCell>
                                                                <TableCell>
                                                                    {session.client_name ? (
                                                                        <Badge variant="secondary">{session.client_name}</Badge>
                                                                    ) : (
                                                                        <span className="text-muted-foreground">No client</span>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge variant="outline">{session.status}</Badge>
                                                                </TableCell>
                                                                <TableCell className="hidden md:table-cell">
                                                                    {new Date(session.created_at).toLocaleDateString()}
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
                                                                                    href={`/dashboard/workspaces/${workspaceId}/tax-assistant/${session.id}/`}
                                                                                >
                                                                                    View Session
                                                                                </Link>
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem>
                                                                                Restore Session
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
                                            <div className="text-xs text-muted-foreground">Showing archived sessions</div>
                                        </CardFooter>
                                    </Card>
                                </TabsContent>
                            </>
                        )}
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
