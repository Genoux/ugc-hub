'use client'

import { useState } from 'react'
import { approveSubmission, rejectSubmission } from '../actions/review-submission'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Separator } from '@/shared/components/ui/separator'

type Submission = {
  id: string
  creatorName: string
  creatorEmail: string
  creatorNotes: string | null
  status: string
  createdAt: Date
  reviewedAt: Date | null
}

type Asset = {
  id: string
  filename: string
  mimeType: string
  sizeBytes: number
  uploadStatus: string
}

export function SubmissionReview({
  campaignName,
  submission,
  assets,
}: {
  campaignName: string
  submission: Submission
  assets: Asset[]
}) {
  const [isReviewing, setIsReviewing] = useState(false)

  async function handleApprove() {
    setIsReviewing(true)
    try {
      await approveSubmission(submission.id)
    } catch (error) {
      console.error('Failed to approve:', error)
    } finally {
      setIsReviewing(false)
    }
  }

  async function handleReject() {
    setIsReviewing(true)
    try {
      await rejectSubmission(submission.id)
    } catch (error) {
      console.error('Failed to reject:', error)
    } finally {
      setIsReviewing(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{campaignName}</h1>
          <p className="text-sm text-muted-foreground">Submission Review</p>
        </div>
        <Badge
          variant={
            submission.status === 'approved'
              ? 'default'
              : submission.status === 'rejected'
                ? 'destructive'
                : 'secondary'
          }
        >
          {submission.status}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Creator Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-1">
            <span className="text-xs text-muted-foreground">Name</span>
            <span className="text-sm font-medium">{submission.creatorName}</span>
          </div>
          <Separator />
          <div className="grid gap-1">
            <span className="text-xs text-muted-foreground">Email</span>
            <span className="text-sm font-medium">{submission.creatorEmail}</span>
          </div>
          {submission.creatorNotes && (
            <>
              <Separator />
              <div className="grid gap-1">
                <span className="text-xs text-muted-foreground">Notes</span>
                <span className="text-sm">{submission.creatorNotes}</span>
              </div>
            </>
          )}
          <Separator />
          <div className="grid gap-1">
            <span className="text-xs text-muted-foreground">Submitted</span>
            <span className="text-sm">{new Date(submission.createdAt).toLocaleString()}</span>
          </div>
          {submission.reviewedAt && (
            <>
              <Separator />
              <div className="grid gap-1">
                <span className="text-xs text-muted-foreground">Reviewed</span>
                <span className="text-sm">{new Date(submission.reviewedAt).toLocaleString()}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assets ({assets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {assets.length === 0 ? (
            <p className="text-sm text-muted-foreground">No assets uploaded</p>
          ) : (
            <div className="space-y-2">
              {assets.map(asset => (
                <div key={asset.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{asset.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {asset.mimeType} • {(asset.sizeBytes / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Badge variant={asset.uploadStatus === 'completed' ? 'default' : 'secondary'}>
                    {asset.uploadStatus}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {submission.status === 'pending' && (
        <div className="flex gap-3">
          <Button
            onClick={handleReject}
            disabled={isReviewing}
            variant="outline"
            className="flex-1"
          >
            Reject
          </Button>
          <Button
            onClick={handleApprove}
            disabled={isReviewing}
            className="flex-1"
          >
            Approve
          </Button>
        </div>
      )}
    </div>
  )
}
