import { db } from '@/shared/lib/db'
import { campaigns, submissions, assets } from '@/db/schema'
import { getCurrentUser } from '@/shared/lib/auth'
import { eq, and } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { SubmissionReview } from '@/features/submissions/components/submission-review'
import { Button } from '@/shared/components/ui/button'

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
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Button variant="outline" size="sm" asChild className="w-fit">
        <Link href={`/campaigns/${id}`}>
          <ChevronLeft className="size-4" />
          Back to Campaign
        </Link>
      </Button>

      <SubmissionReview
        campaignName={campaign.name}
        submission={submission}
        assets={submissionAssets}
      />
    </div>
  )
}
