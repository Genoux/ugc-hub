'use client'

import { useState } from 'react'
import { approveSubmission, rejectSubmission } from '../actions/review-submission'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'

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
    <div className="space-y-8">
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

      <div className="space-y-3">
        <h2 className="text-sm font-medium">Creator Information</h2>
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-muted-foreground">Name:</span>{' '}
            <span className="font-medium">{submission.creatorName}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Email:</span>{' '}
            <span className="font-medium">{submission.creatorEmail}</span>
          </div>
          {submission.creatorNotes && (
            <div>
              <span className="text-muted-foreground">Notes:</span>{' '}
              <span>{submission.creatorNotes}</span>
            </div>
          )}
          <div>
            <span className="text-muted-foreground">Submitted:</span>{' '}
            {new Date(submission.createdAt).toLocaleString()}
          </div>
          {submission.reviewedAt && (
            <div>
              <span className="text-muted-foreground">Reviewed:</span>{' '}
              {new Date(submission.reviewedAt).toLocaleString()}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium">Assets ({assets.length})</h2>
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
      </div>

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
