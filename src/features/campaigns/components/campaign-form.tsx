'use client'

import { useState } from 'react'
import { createCampaign } from '../actions/create-campaign'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'

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
          maxFileSize: 100 * 1024 * 1024,
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
      <div className="space-y-2">
        <Label htmlFor="name">
          Campaign Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          placeholder="Enter campaign name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          name="description"
          placeholder="Brief description (optional)"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="brief">
          Brief <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="brief"
          name="brief"
          placeholder="Detailed campaign brief for creators"
          required
          rows={4}
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Creating...' : 'Create Campaign'}
      </Button>
    </form>
  )
}
