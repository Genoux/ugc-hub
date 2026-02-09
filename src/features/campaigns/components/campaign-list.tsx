'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CampaignForm } from './campaign-form'
import { Button } from '@/shared/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog'
import { Badge } from '@/shared/components/ui/badge'

type Campaign = {
  id: string
  name: string
  description: string | null
  brief: string
  status: string
}

export function CampaignList({ campaigns }: { campaigns: Campaign[] }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <div className="flex flex-1 flex-col gap-8 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Campaigns</h1>
          <p className="text-sm text-muted-foreground">
            Manage your UGC campaigns and submissions
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>New Campaign</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Campaign</DialogTitle>
            </DialogHeader>
            <CampaignForm onSuccess={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {campaigns.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">
            No campaigns yet. Create your first one!
          </p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map(c => (
            <Link key={c.id} href={`/campaigns/${c.id}`}>
              <div className="group rounded-lg border p-4 transition-colors hover:border-primary/50">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold">{c.name}</h3>
                  <Badge variant="secondary">{c.status}</Badge>
                </div>
                {c.description && (
                  <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
