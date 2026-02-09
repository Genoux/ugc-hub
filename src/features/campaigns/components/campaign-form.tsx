'use client'

import { useState } from 'react'
import { createCampaign } from '../actions/create-campaign'

export function CampaignForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    
    try {
      await createCampaign({
        name: formData.get('name') as string,
        description: formData.get('description') as string || undefined,
        brief: formData.get('brief') as string,
        assetRequirements: {
          acceptedTypes: ['image/jpeg', 'image/png', 'video/mp4'],
          maxFiles: 10,
          maxFileSize: 100 * 1024 * 1024, // 100MB
        },
      })
      
      onSuccess?.()
      e.currentTarget.reset()
    } catch (error) {
      console.error('Failed to create campaign:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Campaign Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Description
        </label>
        <input
          type="text"
          id="description"
          name="description"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="brief" className="block text-sm font-medium">
          Brief
        </label>
        <textarea
          id="brief"
          name="brief"
          required
          rows={4}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Creating...' : 'Create Campaign'}
      </button>
    </form>
  )
}
