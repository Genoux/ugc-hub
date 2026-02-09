import { db } from '@/shared/lib/db'
import { campaigns, links, submissions } from '@/db/schema'
import { getCurrentUser } from '@/shared/lib/auth'
import { eq, and } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { LinkList } from '@/features/links/components/link-list'
import { SubmissionList } from '@/features/submissions/components/submission-list'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()

  const campaign = await db.query.campaigns.findFirst({
    where: and(
      eq(campaigns.id, id),
      eq(campaigns.userId, user.id)
    ),
  })

  if (!campaign) {
    notFound()
  }

  const campaignLinks = await db.query.links.findMany({
    where: eq(links.campaignId, id),
    orderBy: (links, { desc }) => [desc(links.createdAt)],
  })

  const campaignSubmissions = await db.query.submissions.findMany({
    where: eq(submissions.campaignId, id),
    orderBy: (submissions, { desc }) => [desc(submissions.createdAt)],
  })

  return (
    <div className="flex flex-1 flex-col gap-8 p-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/campaigns">
            <ChevronLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">{campaign.name}</h1>
            <Badge variant="secondary">{campaign.status}</Badge>
          </div>
          {campaign.description && (
            <p className="text-sm text-muted-foreground">{campaign.description}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">Brief</h2>
        <p className="whitespace-pre-wrap text-sm">{campaign.brief}</p>
      </div>

      <LinkList campaignId={campaign.id} links={campaignLinks} />
      <SubmissionList campaignId={campaign.id} submissions={campaignSubmissions} />
    </div>
  )
}
