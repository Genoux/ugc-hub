'use client'

import { useState } from 'react'
import { createLink } from '../actions/create-link'
import { revokeLink } from '../actions/revoke-link'

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
    if (!confirm('Are you sure you want to revoke this link?')) return
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
    <div className="mt-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Submission Links</h2>
        <button
          onClick={handleCreate}
          disabled={isCreating}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isCreating ? 'Creating...' : 'Generate Link'}
        </button>
      </div>

      {links.length === 0 ? (
        <p className="text-gray-500">No links yet. Generate one to share with creators.</p>
      ) : (
        <div className="space-y-2">
          {links.map(link => (
            <div
              key={link.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex-1">
                <p className="font-mono text-sm">{`/submit/${link.token}`}</p>
                <p className="text-xs text-gray-500">
                  Status: {link.status} | Created: {new Date(link.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopy(link.token)}
                  className="rounded bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200"
                >
                  {copiedToken === link.token ? 'Copied!' : 'Copy URL'}
                </button>
                {link.status === 'active' && (
                  <button
                    onClick={() => handleRevoke(link.id)}
                    className="rounded bg-red-100 px-3 py-1 text-sm text-red-700 hover:bg-red-200"
                  >
                    Revoke
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
