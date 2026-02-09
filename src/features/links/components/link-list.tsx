'use client'

import { useState } from 'react'
import { Copy, Trash2 } from 'lucide-react'
import { createLink } from '../actions/create-link'
import { revokeLink } from '../actions/revoke-link'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'

type Link = {
  id: string
  token: string
  status: string
  createdAt: Date
  expiresAt: Date | null
}

export function LinkList({ campaignId, links }: { campaignId: string; links: Link[] }) {
  const [isCreating, setIsCreating] = useState(false)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  async function handleCreate() {
    setIsCreating(true)
    try {
      await createLink({ campaignId })
    } catch (error) {
      console.error('Failed to create link:', error)
    } finally {
      setIsCreating(false)
    }
  }

  async function handleRevoke(linkId: string) {
    try {
      await revokeLink(linkId)
    } catch (error) {
      console.error('Failed to revoke link:', error)
    }
  }

  async function handleCopy(token: string) {
    const url = `${window.location.origin}/submit/${token}`
    await navigator.clipboard.writeText(url)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Submission Links</CardTitle>
          <Button onClick={handleCreate} disabled={isCreating} size="sm">
            {isCreating ? 'Creating...' : 'Generate Link'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {links.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No links yet. Generate one to share with creators.
          </p>
        ) : (
          <div className="space-y-2">
            {links.map(link => (
              <div
                key={link.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex-1 space-y-1">
                  <p className="font-mono text-sm">{`/submit/${link.token}`}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {link.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(link.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleCopy(link.token)}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="size-4" />
                    {copiedToken === link.token ? 'Copied!' : 'Copy'}
                  </Button>
                  {link.status === 'active' && (
                    <Button
                      onClick={() => handleRevoke(link.id)}
                      variant="outline"
                      size="sm"
                    >
                      <Trash2 className="size-4" />
                      Revoke
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
