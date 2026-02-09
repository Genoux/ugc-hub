import { db } from '@/shared/lib/db'
import { campaigns, submissions, assets } from '@/db/schema'
import { getCurrentUser } from '@/shared/lib/auth'
import { eq, and } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { SubmissionReview } from '@/features/submissions/components/submission-review'

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string; submissionId: string }>
}) {
  const { id, submissionId } = await params
  const user = await getCurrentUser()

  const campaign = await db.query.campaigns.findFirst({
    where: and(eq(campaigns.id, id), eq(campaigns.userId, user.id)),
  })

  if (!campaign) {
    notFound()
  }

  const submission = await db.query.submissions.findFirst({
    where: and(
      eq(submissions.id, submissionId),
      eq(submissions.campaignId, id)
    ),
  })

  if (!submission) {
    notFound()
  }

  const submissionAssets = await db.query.assets.findMany({
    where: eq(assets.submissionId, submissionId),
  })

  return (
    <div className="p-8">
      <div className="mb-6">
        <a
          href={`/campaigns/${id}`}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          ← Back to Campaign
        </a>
      </div>

      <SubmissionReview
        campaignName={campaign.name}
        submission={submission}
        assets={submissionAssets}
      />
    </div>
  )
}
