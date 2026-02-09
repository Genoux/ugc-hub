'use client'

import { useState } from 'react'
import { approveSubmission, rejectSubmission } from '../actions/review-submission'

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
    if (!confirm('Approve this submission?')) return
    setIsReviewing(true)
    try {
      await approveSubmission(submission.id)
    } catch (error) {
      console.error('Failed to approve:', error)
      alert('Failed to approve submission')
    } finally {
      setIsReviewing(false)
    }
  }

  async function handleReject() {
    if (!confirm('Reject this submission?')) return
    setIsReviewing(true)
    try {
      await rejectSubmission(submission.id)
    } catch (error) {
      console.error('Failed to reject:', error)
      alert('Failed to reject submission')
    } finally {
      setIsReviewing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{campaignName}</h1>
        <p className="text-gray-600">Submission Review</p>
      </div>

      <div className="rounded-lg border p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Creator Information</h2>
          <span
            className={`rounded px-3 py-1 text-sm ${
              submission.status === 'approved'
                ? 'bg-green-100 text-green-700'
                : submission.status === 'rejected'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700'
            }`}
          >
            {submission.status}
          </span>
        </div>

        <div className="space-y-2">
          <p>
            <strong>Name:</strong> {submission.creatorName}
          </p>
          <p>
            <strong>Email:</strong> {submission.creatorEmail}
          </p>
          {submission.creatorNotes && (
            <p>
              <strong>Notes:</strong> {submission.creatorNotes}
            </p>
          )}
          <p>
            <strong>Submitted:</strong> {new Date(submission.createdAt).toLocaleString()}
          </p>
          {submission.reviewedAt && (
            <p>
              <strong>Reviewed:</strong> {new Date(submission.reviewedAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">Assets ({assets.length})</h2>
        {assets.length === 0 ? (
          <p className="text-gray-500">No assets uploaded</p>
        ) : (
          <div className="space-y-2">
            {assets.map(asset => (
              <div key={asset.id} className="flex items-center justify-between rounded border p-3">
                <div>
                  <p className="font-medium">{asset.filename}</p>
                  <p className="text-sm text-gray-500">
                    {asset.mimeType} • {(asset.sizeBytes / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <span
                  className={`rounded px-2 py-1 text-xs ${
                    asset.uploadStatus === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {asset.uploadStatus}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {submission.status === 'pending' && (
        <div className="flex gap-3">
          <button
            onClick={handleReject}
            disabled={isReviewing}
            className="flex-1 rounded-md border border-red-300 px-4 py-2 text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            Reject
          </button>
          <button
            onClick={handleApprove}
            disabled={isReviewing}
            className="flex-1 rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
          >
            Approve
          </button>
        </div>
      )}
    </div>
  )
}
