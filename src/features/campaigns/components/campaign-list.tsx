'use client'

import { useState } from 'react'
import { CampaignForm } from './campaign-form'

type Campaign = {
  id: string
  name: string
  description: string | null
  brief: string
}

export function CampaignList({ campaigns }: { campaigns: Campaign[] }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Campaigns</h1>
        <button
          onClick={() => setIsDialogOpen(true)}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          New Campaign
        </button>
      </div>

      {campaigns.length === 0 ? (
        <p className="text-gray-500">No campaigns yet. Create your first one!</p>
      ) : (
        <ul className="space-y-2">
          {campaigns.map(c => (
            <li key={c.id} className="rounded-lg border p-4">
              <h2 className="font-semibold">{c.name}</h2>
              {c.description && <p className="text-sm text-gray-600">{c.description}</p>}
            </li>
          ))}
        </ul>
      )}

      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">New Campaign</h2>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <CampaignForm onSuccess={() => setIsDialogOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
