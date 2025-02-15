import Link from 'next/link'

import { MoreHorizontal } from 'lucide-react'

import { ChatSession } from '@/types/chat'
import { ChatSessionCreatemodal } from '@/components/chat/chat-session-create-modal'
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

interface ChatListProps {
    workspaceId: string
    chatSessions: ChatSession[] | null | undefined
}

export function ChatSessionsList({ workspaceId, chatSessions = [] }: ChatListProps) {
    const hasChatSessions = chatSessions && Array.isArray(chatSessions) && chatSessions.length > 0

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40 pt-4">
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                    <Tabs defaultValue="active">
                        <div className="flex items-center">
                            {hasChatSessions && (
                                <TabsList>
                                    <TabsTrigger value="all">All</TabsTrigger>
                                    <TabsTrigger value="active">Active</TabsTrigger>
                                    <TabsTrigger value="archived" className="hidden sm:flex">
                                        Archived
                                    </TabsTrigger>
                                </TabsList>
                            )}
                            {!hasChatSessions && (
                                <div className="text-lg font-medium text-muted-foreground">No chat sessions found</div>
                            )}
                            <div className="ml-auto flex items-center gap-2">
                                <ChatSessionCreatemodal workspaceId={workspaceId} />
                            </div>
                        </div>

                        {hasChatSessions && (
                            <>
                                <TabsContent value="all">
                                    <Card x-chunk="dashboard-06-chunk-0">
                                        <CardHeader>
                                            <CardTitle>Your Chat sessions</CardTitle>
                                            <CardDescription>Manage your chat sessions.</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Name</TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead className="hidden md:table-cell">Id</TableHead>
                                                        <TableHead>
                                                            <span className="sr-only">Actions</span>
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {chatSessions.map((session) => (
                                                        <TableRow key={session.id}>
                                                            <TableCell className="font-medium">
                                                                <Link
                                                                    href={`/dashboard/workspaces/${workspaceId}/chat/${session.id}/`}
                                                                >
                                                                    {session.name}
                                                                </Link>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="outline">{session.status}</Badge>
                                                            </TableCell>
                                                            <TableCell className="hidden md:table-cell">
                                                                <Link
                                                                    href={`/dashboard/workspaces/${workspaceId}/chat/${session.id}/`}
                                                                >
                                                                    {session.id}
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
                                                                                href={`/dashboard/workspaces/${workspaceId}/chat/${session.id}/`}
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
                                            <div className="text-xs text-muted-foreground">
                                                Showing all chat sessions
                                            </div>
                                        </CardFooter>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="active">
                                    <Card x-chunk="dashboard-06-chunk-0">
                                        <CardHeader>
                                            <CardTitle>Active Chats</CardTitle>
                                            <CardDescription>Manage your current chat.</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Name</TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead className="hidden md:table-cell">Id</TableHead>
                                                        <TableHead>
                                                            <span className="sr-only">Actions</span>
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {chatSessions
                                                        .filter((chat) => chat.status === 'active')
                                                        .map((chat) => (
                                                            <TableRow key={chat.id}>
                                                                <TableCell className="font-medium">
                                                                    <Link
                                                                        href={`/dashboard/workspaces/${workspaceId}/chat/${chat.id}/`}
                                                                    >
                                                                        {chat.name}
                                                                    </Link>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge variant="outline">{chat.status}</Badge>
                                                                </TableCell>
                                                                <TableCell className="hidden md:table-cell">
                                                                    <Link
                                                                        href={`/dashboard/workspaces/${workspaceId}/chat/${chat.id}/`}
                                                                    >
                                                                        {chat.id}
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
                                                                                <span className="sr-only">
                                                                                    Toggle menu
                                                                                </span>
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end">
                                                                            <DropdownMenuLabel>
                                                                                Actions
                                                                            </DropdownMenuLabel>
                                                                            <DropdownMenuItem>
                                                                                <Link
                                                                                    href={`/dashboard/workspaces/${workspaceId}/chat/${chat.id}/`}
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
                                            <div className="text-xs text-muted-foreground">Showing active chats</div>
                                        </CardFooter>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="archived">
                                    <Card x-chunk="dashboard-06-chunk-0">
                                        <CardHeader>
                                            <CardTitle>Archived Chats</CardTitle>
                                            <CardDescription>Manage your archived chats.</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Name</TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead className="hidden md:table-cell">Id</TableHead>
                                                        <TableHead>
                                                            <span className="sr-only">Actions</span>
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {chatSessions
                                                        .filter((chat) => chat.status === 'archived')
                                                        .map((chat) => (
                                                            <TableRow key={chat.id}>
                                                                <TableCell className="font-medium">
                                                                    <Link
                                                                        href={`/dashboard/workspaces/${workspaceId}/chat/${chat.id}/`}
                                                                    >
                                                                        {chat.name}
                                                                    </Link>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge variant="outline">{chat.status}</Badge>
                                                                </TableCell>
                                                                <TableCell className="hidden md:table-cell">
                                                                    <Link
                                                                        href={`/dashboard/workspaces/${workspaceId}/chat/${chat.id}/`}
                                                                    >
                                                                        {chat.id}
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
                                                                                <span className="sr-only">
                                                                                    Toggle menu
                                                                                </span>
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end">
                                                                            <DropdownMenuLabel>
                                                                                Actions
                                                                            </DropdownMenuLabel>
                                                                            <DropdownMenuItem>
                                                                                <Link
                                                                                    href={`/dashboard/workspaces/${workspaceId}/chat/${chat.id}/`}
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
                                            <div className="text-xs text-muted-foreground">Showing archived chats</div>
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
