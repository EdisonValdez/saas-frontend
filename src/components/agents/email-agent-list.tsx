import Link from 'next/link'
import { MoreHorizontal, Mail, Send } from 'lucide-react'

import { EmailAgentSession } from '@/types/agents'
import { EmailAgentCreateModal } from '@/components/agents/email-agent-create-modal'
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

interface EmailAgentListProps {
    workspaceId: string
    emailAgentSessions: EmailAgentSession[] | null | undefined
}

export function EmailAgentSessionsList({ workspaceId, emailAgentSessions = [] }: EmailAgentListProps) {
    const hasSessions = emailAgentSessions && Array.isArray(emailAgentSessions) && emailAgentSessions.length > 0

    const getEmailTypeColor = (type: string) => {
        switch (type) {
            case 'draft':
                return 'bg-blue-100 text-blue-800'
            case 'response':
                return 'bg-green-100 text-green-800'
            case 'follow_up':
                return 'bg-orange-100 text-orange-800'
            case 'notification':
                return 'bg-purple-100 text-purple-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40 pt-4">
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center gap-2">
                            <Mail className="h-6 w-6 text-purple-600" />
                            <h1 className="text-2xl font-bold">Email Agent Sessions</h1>
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
                                <div className="text-lg font-medium text-muted-foreground">No email agent sessions found</div>
                            )}
                            <div className="ml-auto flex items-center gap-2">
                                <EmailAgentCreateModal workspaceId={workspaceId} />
                            </div>
                        </div>

                        {hasSessions && (
                            <>
                                <TabsContent value="all">
                                    <Card x-chunk="email-agent-01">
                                        <CardHeader>
                                            <CardTitle>Your Email Agent Sessions</CardTitle>
                                            <CardDescription>Manage your email composition and response sessions with AI assistance.</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Name</TableHead>
                                                        <TableHead>Client</TableHead>
                                                        <TableHead>Type</TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead className="hidden md:table-cell">Created</TableHead>
                                                        <TableHead>
                                                            <span className="sr-only">Actions</span>
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {emailAgentSessions.map((session) => (
                                                        <TableRow key={session.id}>
                                                            <TableCell className="font-medium">
                                                                <Link
                                                                    href={`/dashboard/workspaces/${workspaceId}/email-agent/${session.id}/`}
                                                                    className="flex items-center gap-2 hover:text-purple-600"
                                                                >
                                                                    <Send className="h-4 w-4" />
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
                                                                <Badge className={getEmailTypeColor(session.email_type)}>
                                                                    {session.email_type}
                                                                </Badge>
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
                                                                                href={`/dashboard/workspaces/${workspaceId}/email-agent/${session.id}/`}
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
                                                Showing all email agent sessions
                                            </div>
                                        </CardFooter>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="active">
                                    <Card x-chunk="email-agent-02">
                                        <CardHeader>
                                            <CardTitle>Active Email Sessions</CardTitle>
                                            <CardDescription>Currently active email composition sessions.</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Name</TableHead>
                                                        <TableHead>Client</TableHead>
                                                        <TableHead>Type</TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead className="hidden md:table-cell">Created</TableHead>
                                                        <TableHead>
                                                            <span className="sr-only">Actions</span>
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {emailAgentSessions
                                                        .filter((session) => session.status === 'active')
                                                        .map((session) => (
                                                            <TableRow key={session.id}>
                                                                <TableCell className="font-medium">
                                                                    <Link
                                                                        href={`/dashboard/workspaces/${workspaceId}/email-agent/${session.id}/`}
                                                                        className="flex items-center gap-2 hover:text-purple-600"
                                                                    >
                                                                        <Send className="h-4 w-4" />
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
                                                                    <Badge className={getEmailTypeColor(session.email_type)}>
                                                                        {session.email_type}
                                                                    </Badge>
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
                                                                                    href={`/dashboard/workspaces/${workspaceId}/email-agent/${session.id}/`}
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
                                    <Card x-chunk="email-agent-03">
                                        <CardHeader>
                                            <CardTitle>Archived Email Sessions</CardTitle>
                                            <CardDescription>Previously archived email composition sessions.</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Name</TableHead>
                                                        <TableHead>Client</TableHead>
                                                        <TableHead>Type</TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead className="hidden md:table-cell">Created</TableHead>
                                                        <TableHead>
                                                            <span className="sr-only">Actions</span>
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {emailAgentSessions
                                                        .filter((session) => session.status === 'archived')
                                                        .map((session) => (
                                                            <TableRow key={session.id}>
                                                                <TableCell className="font-medium">
                                                                    <Link
                                                                        href={`/dashboard/workspaces/${workspaceId}/email-agent/${session.id}/`}
                                                                        className="flex items-center gap-2 hover:text-purple-600"
                                                                    >
                                                                        <Send className="h-4 w-4" />
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
                                                                    <Badge className={getEmailTypeColor(session.email_type)}>
                                                                        {session.email_type}
                                                                    </Badge>
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
                                                                                    href={`/dashboard/workspaces/${workspaceId}/email-agent/${session.id}/`}
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
