'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Calculator } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { siteConfig } from '@/config/site'

interface TaxAssistantCreateModalProps {
    workspaceId: string
}

interface ClientOption {
    id: string
    name: string
}

export function TaxAssistantCreateModal({ workspaceId }: TaxAssistantCreateModalProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [sessionName, setSessionName] = useState('')
    const [selectedClientId, setSelectedClientId] = useState<string>('')
    const [clients, setClients] = useState<ClientOption[]>([])
    const [loadingClients, setLoadingClients] = useState(false)

    const handleOpenChange = async (isOpen: boolean) => {
        setOpen(isOpen)
        if (isOpen && clients.length === 0) {
            await loadClients()
        }
    }

    const loadClients = async () => {
        setLoadingClients(true)
        try {
            const response = await fetch(`${siteConfig.paths.api.workspaces.workspaces}${workspaceId}/clients/`)
            if (response.ok) {
                const clientsData = await response.json()
                setClients(clientsData || [])
            }
        } catch (error) {
            console.error('Failed to load clients:', error)
            toast({
                title: 'Error',
                description: 'Failed to load clients. You can still create a session without a client.',
                variant: 'destructive',
            })
        } finally {
            setLoadingClients(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!sessionName.trim()) {
            toast({
                title: 'Session name required',
                description: 'Please enter a name for your tax assistant session.',
                variant: 'destructive',
            })
            return
        }

        setIsLoading(true)

        try {
            const selectedClient = clients.find(c => c.id === selectedClientId)
            
            const payload = {
                name: sessionName.trim(),
                client_id: selectedClientId || null,
                client_name: selectedClient?.name || null,
            }

            const response = await fetch(`${siteConfig.paths.api.workspaces.workspaces}${workspaceId}/tax-assistant/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })

            if (response.ok) {
                const newSession = await response.json()
                toast({
                    title: 'Tax Assistant Session Created',
                    description: `Session "${sessionName}" has been created successfully.`,
                })
                setOpen(false)
                setSessionName('')
                setSelectedClientId('')
                router.push(`/dashboard/workspaces/${workspaceId}/tax-assistant/${newSession.id}/`)
                router.refresh()
            } else {
                throw new Error('Failed to create session')
            }
        } catch (error) {
            console.error('Error creating tax assistant session:', error)
            toast({
                title: 'Error',
                description: 'Failed to create tax assistant session. Please try again.',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Tax Session
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5 text-blue-600" />
                        Create Tax Assistant Session
                    </DialogTitle>
                    <DialogDescription>
                        Start a new tax consultation session with AI assistance. You can optionally link it to a specific client.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="sessionName">Session Name</Label>
                            <Input
                                id="sessionName"
                                placeholder="e.g., 2024 Tax Return Review"
                                value={sessionName}
                                onChange={(e) => setSessionName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="client">Client (Optional)</Label>
                            <Select value={selectedClientId} onValueChange={setSelectedClientId} disabled={loadingClients}>
                                <SelectTrigger>
                                    <SelectValue placeholder={loadingClients ? "Loading clients..." : "Select a client"} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">No client selected</SelectItem>
                                    {clients.map((client) => (
                                        <SelectItem key={client.id} value={client.id}>
                                            {client.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Create Session'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
