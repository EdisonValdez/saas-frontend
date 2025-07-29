'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  History, GitBranch, Clock, User, FileText, CheckCircle, 
  AlertTriangle, Info, ChevronRight, Edit3, Eye, Send,
  Signature, Shield, Download, RefreshCw, Archive,
  ArrowUpCircle, ArrowDownCircle, Zap
} from 'lucide-react'
import { toast } from 'sonner'

interface FormVersion {
  id: string
  version: string
  createdAt: string
  createdBy: string
  status: 'draft' | 'review' | 'finalized' | 'filed'
  changes: string[]
  size: string
  notes?: string
  isActive: boolean
  checksum: string
}

interface AuditLogEntry {
  id: string
  timestamp: string
  action: string
  user: string
  details: string
  ipAddress: string
  userAgent: string
  metadata?: Record<string, any>
}

interface ElectronicSignature {
  id: string
  signerName: string
  signerEmail: string
  signedAt: string
  ipAddress: string
  status: 'pending' | 'signed' | 'declined' | 'expired'
  documentHash: string
  signatureImage?: string
}

interface FormManagementPanelProps {
  formId: string
  currentStatus: string
  onStatusChange: (newStatus: string) => void
}

export default function FormManagementPanel({ 
  formId, 
  currentStatus, 
  onStatusChange 
}: FormManagementPanelProps) {
  const [versions, setVersions] = useState<FormVersion[]>([])
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([])
  const [signatures, setSignatures] = useState<ElectronicSignature[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<string>('')

  useEffect(() => {
    loadFormManagementData()
  }, [formId])

  const loadFormManagementData = async () => {
    setIsLoading(true)
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data
      setVersions([
        {
          id: 'v1',
          version: '1.0.0',
          createdAt: '2024-01-15T10:30:00Z',
          createdBy: 'John Smith',
          status: 'filed',
          changes: ['Initial form creation', 'Added client basic information'],
          size: '2.3 MB',
          isActive: false,
          checksum: 'sha256:abc123...'
        },
        {
          id: 'v2',
          version: '1.1.0',
          createdAt: '2024-01-16T14:20:00Z',
          createdBy: 'Jane Doe',
          status: 'finalized',
          changes: ['Updated income calculations', 'Added Schedule A attachment'],
          size: '2.5 MB',
          notes: 'Final review completed by senior accountant',
          isActive: false,
          checksum: 'sha256:def456...'
        },
        {
          id: 'v3',
          version: '1.2.0',
          createdAt: '2024-01-17T09:15:00Z',
          createdBy: 'John Smith',
          status: 'review',
          changes: ['Corrected deduction amounts', 'Added missing supporting documents'],
          size: '2.7 MB',
          notes: 'Pending client review and approval',
          isActive: true,
          checksum: 'sha256:ghi789...'
        }
      ])

      setAuditLog([
        {
          id: 'audit1',
          timestamp: '2024-01-17T09:15:23Z',
          action: 'Form Created',
          user: 'John Smith',
          details: 'Created new form version 1.2.0',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...'
        },
        {
          id: 'audit2',
          timestamp: '2024-01-17T09:20:45Z',
          action: 'Field Updated',
          user: 'John Smith',
          details: 'Updated field "Total Income" from $75,000 to $77,100',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
          metadata: { fieldName: 'total_income', oldValue: 75000, newValue: 77100 }
        },
        {
          id: 'audit3',
          timestamp: '2024-01-17T09:25:12Z',
          action: 'Status Changed',
          user: 'John Smith',
          details: 'Changed status from "Draft" to "Review"',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
          metadata: { oldStatus: 'draft', newStatus: 'review' }
        },
        {
          id: 'audit4',
          timestamp: '2024-01-16T16:30:00Z',
          action: 'Document Exported',
          user: 'Jane Doe',
          details: 'Exported form as PDF for client review',
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0...'
        },
        {
          id: 'audit5',
          timestamp: '2024-01-16T14:20:15Z',
          action: 'Form Finalized',
          user: 'Jane Doe',
          details: 'Form marked as finalized after senior review',
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0...'
        }
      ])

      setSignatures([
        {
          id: 'sig1',
          signerName: 'John A. Smith',
          signerEmail: 'john.smith@example.com',
          signedAt: '2024-01-16T15:45:00Z',
          ipAddress: '203.0.113.42',
          status: 'signed',
          documentHash: 'sha256:abc123def456...'
        },
        {
          id: 'sig2',
          signerName: 'Jane B. Smith',
          signerEmail: 'jane.smith@example.com',
          signedAt: '2024-01-17T08:30:00Z',
          ipAddress: '203.0.113.43',
          status: 'signed',
          documentHash: 'sha256:ghi789jkl012...'
        },
        {
          id: 'sig3',
          signerName: 'Robert Johnson (CPA)',
          signerEmail: 'r.johnson@cpa-firm.com',
          signedAt: '',
          ipAddress: '',
          status: 'pending',
          documentHash: 'sha256:mno345pqr678...'
        }
      ])

    } catch (error) {
      toast.error('Failed to load form management data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      onStatusChange(newStatus)
      toast.success(`Form status updated to ${newStatus}`)
      
      // Add audit log entry
      const newAuditEntry: AuditLogEntry = {
        id: `audit${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'Status Changed',
        user: 'Current User',
        details: `Changed status from "${currentStatus}" to "${newStatus}"`,
        ipAddress: '192.168.1.100',
        userAgent: navigator.userAgent
      }
      setAuditLog(prev => [newAuditEntry, ...prev])
      
    } catch (error) {
      toast.error('Failed to update form status')
    }
  }

  const createNewVersion = async () => {
    try {
      const newVersion: FormVersion = {
        id: `v${versions.length + 1}`,
        version: `1.${versions.length}.0`,
        createdAt: new Date().toISOString(),
        createdBy: 'Current User',
        status: 'draft',
        changes: ['Created new version for edits'],
        size: '2.8 MB',
        isActive: true,
        checksum: `sha256:new${Date.now()}...`
      }
      
      // Deactivate current version
      setVersions(prev => prev.map(v => ({ ...v, isActive: false })))
      setVersions(prev => [newVersion, ...prev])
      
      toast.success('New version created successfully')
    } catch (error) {
      toast.error('Failed to create new version')
    }
  }

  const restoreVersion = async (versionId: string) => {
    try {
      const version = versions.find(v => v.id === versionId)
      if (!version) return
      
      // Simulate restoration
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setVersions(prev => prev.map(v => ({ 
        ...v, 
        isActive: v.id === versionId 
      })))
      
      toast.success(`Restored to version ${version.version}`)
    } catch (error) {
      toast.error('Failed to restore version')
    }
  }

  const requestSignature = async (email: string) => {
    try {
      // Simulate sending signature request
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newSignature: ElectronicSignature = {
        id: `sig${signatures.length + 1}`,
        signerName: email.split('@')[0],
        signerEmail: email,
        signedAt: '',
        ipAddress: '',
        status: 'pending',
        documentHash: `sha256:${Date.now()}...`
      }
      
      setSignatures(prev => [newSignature, ...prev])
      toast.success(`Signature request sent to ${email}`)
    } catch (error) {
      toast.error('Failed to send signature request')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'review': return 'bg-yellow-100 text-yellow-800'
      case 'finalized': return 'bg-blue-100 text-blue-800'
      case 'filed': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSignatureStatusColor = (status: string) => {
    switch (status) {
      case 'signed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'declined': return 'bg-red-100 text-red-800'
      case 'expired': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Status Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ArrowUpCircle className="w-5 h-5" />
            <span>Status Management</span>
          </CardTitle>
          <CardDescription>
            Manage form status and workflow transitions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-medium">Current Status:</span>
              <Badge className={getStatusColor(currentStatus)}>
                {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <Select value={currentStatus} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="review">Under Review</SelectItem>
                  <SelectItem value="finalized">Finalized</SelectItem>
                  <SelectItem value="filed">Filed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="p-3 border rounded-lg">
              <Edit3 className="w-6 h-6 mx-auto mb-2 text-gray-500" />
              <div className="text-sm font-medium">Draft</div>
              <div className="text-xs text-gray-500">Editable</div>
            </div>
            <div className="p-3 border rounded-lg">
              <Eye className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
              <div className="text-sm font-medium">Review</div>
              <div className="text-xs text-gray-500">Under Review</div>
            </div>
            <div className="p-3 border rounded-lg">
              <CheckCircle className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <div className="text-sm font-medium">Finalized</div>
              <div className="text-xs text-gray-500">Ready to File</div>
            </div>
            <div className="p-3 border rounded-lg">
              <Send className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <div className="text-sm font-medium">Filed</div>
              <div className="text-xs text-gray-500">Submitted</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="versions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="versions">Version History</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          <TabsTrigger value="signatures">E-Signatures</TabsTrigger>
        </TabsList>

        <TabsContent value="versions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <GitBranch className="w-5 h-5" />
                    <span>Version Control</span>
                  </CardTitle>
                  <CardDescription>
                    Track form versions and manage changes
                  </CardDescription>
                </div>
                <Button onClick={createNewVersion}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Create New Version
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {versions.map((version, index) => (
                  <div key={version.id} className={`p-4 border rounded-lg ${version.isActive ? 'ring-2 ring-primary bg-primary/5' : ''}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Badge variant={version.isActive ? 'default' : 'secondary'}>
                          v{version.version}
                        </Badge>
                        {version.isActive && (
                          <Badge variant="outline" className="text-green-600">
                            Active
                          </Badge>
                        )}
                        <Badge className={getStatusColor(version.status)}>
                          {version.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                        {!version.isActive && (
                          <Button 
                            size="sm" 
                            onClick={() => restoreVersion(version.id)}
                          >
                            <ArrowUpCircle className="w-4 h-4 mr-1" />
                            Restore
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="font-medium">Created</div>
                        <div className="text-gray-600">
                          {new Date(version.createdAt).toLocaleDateString()} by {version.createdBy}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">Size</div>
                        <div className="text-gray-600">{version.size}</div>
                      </div>
                      <div>
                        <div className="font-medium">Checksum</div>
                        <div className="text-gray-600 font-mono text-xs">
                          {version.checksum.substring(0, 16)}...
                        </div>
                      </div>
                    </div>
                    
                    {version.changes.length > 0 && (
                      <div className="mt-3">
                        <div className="font-medium text-sm mb-1">Changes:</div>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {version.changes.map((change, i) => (
                            <li key={i} className="flex items-start space-x-2">
                              <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                              <span>{change}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {version.notes && (
                      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                        <Info className="w-4 h-4 inline mr-1 text-blue-600" />
                        {version.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <History className="w-5 h-5" />
                <span>Audit Trail</span>
              </CardTitle>
              <CardDescription>
                Complete history of all form modifications and access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {auditLog.map((entry, index) => (
                    <div key={entry.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{entry.action}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(entry.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">{entry.details}</div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{entry.user}</span>
                          </span>
                          <span>IP: {entry.ipAddress}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signatures" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Signature className="w-5 h-5" />
                    <span>Electronic Signatures</span>
                  </CardTitle>
                  <CardDescription>
                    Manage digital signatures and approvals
                  </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Send className="w-4 h-4 mr-2" />
                      Request Signature
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request Electronic Signature</DialogTitle>
                      <DialogDescription>
                        Send a signature request for this form
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Signer Email Address
                        </label>
                        <input
                          type="email"
                          className="w-full p-2 border rounded"
                          placeholder="Enter email address..."
                          id="signer-email"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline">Cancel</Button>
                        <Button onClick={() => {
                          const email = (document.getElementById('signer-email') as HTMLInputElement)?.value
                          if (email) requestSignature(email)
                        }}>
                          Send Request
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {signatures.map((signature) => (
                  <div key={signature.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Signature className="w-5 h-5 text-gray-500" />
                        <div>
                          <div className="font-medium">{signature.signerName}</div>
                          <div className="text-sm text-gray-600">{signature.signerEmail}</div>
                        </div>
                      </div>
                      <Badge className={getSignatureStatusColor(signature.status)}>
                        {signature.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-medium">Status</div>
                        <div className="text-gray-600 capitalize">{signature.status}</div>
                      </div>
                      <div>
                        <div className="font-medium">Date</div>
                        <div className="text-gray-600">
                          {signature.signedAt ? 
                            new Date(signature.signedAt).toLocaleString() : 
                            'Pending'
                          }
                        </div>
                      </div>
                    </div>
                    
                    {signature.status === 'signed' && (
                      <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-sm">
                        <div className="flex items-center space-x-1 text-green-700">
                          <Shield className="w-4 h-4" />
                          <span>Digitally signed and verified</span>
                        </div>
                        <div className="text-xs text-green-600 mt-1 font-mono">
                          Hash: {signature.documentHash.substring(0, 24)}...
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
