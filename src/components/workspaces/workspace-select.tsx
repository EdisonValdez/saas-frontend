'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { Workspace } from '@/types/workspaces'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectGroup,
    SelectLabel,
} from '@/components/ui/select'

interface WorkspaceSelectProps {
    workspaces: Workspace[]
}

export function WorkspaceSelect({ workspaces }: WorkspaceSelectProps) {
    const router = useRouter()

    const [selectedWorkspaceName, setSelectedWorkspaceName] = useState<string | null>(null)

    const changeHandler = (value: string) => {
        setSelectedWorkspaceName(workspaces.filter((workspace) => workspace.id === value)[0].name)
        router.push(`/dashboard/workspaces/${value}`)
    }

    return (
        <div className="flex items-center justify-center">
            <Select onValueChange={(value) => changeHandler(value)}>
                <SelectTrigger>
                    <div className="flex items-center space-x-2">
                        <SelectValue placeholder="Select a workspace">
                            {selectedWorkspaceName ? (
                                <span className="font-medium">{selectedWorkspaceName}</span>
                            ) : (
                                <span className="font-medium">Select a workspace</span>
                            )}
                        </SelectValue>
                    </div>
                </SelectTrigger>
                <SelectGroup>
                    <SelectContent>
                        <SelectLabel>Workspaces</SelectLabel>
                        {workspaces.map((workspace) => (
                            <SelectItem value={workspace.id} key={workspace.id}>
                                {workspace.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </SelectGroup>
            </Select>
        </div>
    )
}
