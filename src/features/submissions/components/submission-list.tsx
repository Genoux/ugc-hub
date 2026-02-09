'use client'

import Link from 'next/link'
import { Badge } from '@/shared/components/ui/badge'

type Submission = {
  id: string
  creatorName: string
  creatorEmail: string
  status: string
  createdAt: Date
}

export function SubmissionList({
  campaignId,
  submissions,
}: {
  campaignId: string
  submissions: Submission[]
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium">Submissions</h2>

      {submissions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No submissions yet.</p>
      ) : (
        <div className="space-y-2">
          {submissions.map(submission => (
            <Link
              key={submission.id}
              href={`/campaigns/${campaignId}/submissions/${submission.id}`}
            >
              <div className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:border-primary/50">
                <div>
                  <p className="text-sm font-medium">{submission.creatorName}</p>
                  <p className="text-xs text-muted-foreground">{submission.creatorEmail}</p>
                </div>
                <div className="flex items-center gap-2">
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
                  <span className="text-xs text-muted-foreground">
                    {new Date(submission.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
