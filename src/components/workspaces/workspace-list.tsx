import Link from 'next/link'

import { Workspace } from '@/types/workspaces'

import { Card, CardContent } from '@/components/ui/card'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { WorkspaceDeleteModal } from '@/components/workspaces/workspace-delete-modal'

export const revalidate = 10

interface WorkspaceListProps {
    workspaces: Workspace[] | null | undefined
}

export function WorkspaceList({ workspaces = [] }: WorkspaceListProps) {
    return (
        <Card>
            {/* <CardHeader>
                <CardTitle>Your Workspaces</CardTitle>
            </CardHeader> */}
            <CardContent>
                <Table className="rounded-lg">
                    {/* <TableCaption>Your Workspaces</TableCaption> */}
                    <TableHeader>
                        <TableRow>
                            <TableHead>Workspace</TableHead>
                            <TableHead>Status</TableHead>
                            {/* <TableHead>Id</TableHead> */}
                            <TableHead>Home</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead>Delete</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {workspaces &&
                            workspaces.map((workspace) => (
                                <TableRow key={workspace.slug}>
                                    <TableCell className="font-medium">{workspace.name}</TableCell>
                                    <TableCell>{workspace.status}</TableCell>
                                    {/* <TableCell>{workspace.id}</TableCell> */}
                                    <TableCell>
                                        <Link href={`/dashboard/workspaces/${workspace.id}`}>
                                            <Button>Home</Button>
                                        </Link>{' '}
                                    </TableCell>

                                    <TableCell>
                                        <Link href={`/dashboard/workspaces/${workspace.id}/details`}>
                                            <Button>Details</Button>
                                        </Link>{' '}
                                    </TableCell>

                                    <TableCell>
                                        <WorkspaceDeleteModal
                                            workspaceId={workspace.id}
                                            workspaceName={workspace.name}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
