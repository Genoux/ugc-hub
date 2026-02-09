import { db } from '@/shared/lib/db'
import { campaigns, links } from '@/db/schema'
import { getCurrentUser } from '@/shared/lib/auth'
import { eq, and } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { LinkList } from '@/features/links/components/link-list'

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

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{campaign.name}</h1>
        {campaign.description && (
          <p className="mt-2 text-gray-600">{campaign.description}</p>
        )}
      </div>

      <div className="rounded-lg border p-6">
        <h2 className="mb-2 font-semibold">Brief</h2>
        <p className="whitespace-pre-wrap text-gray-700">{campaign.brief}</p>
      </div>

      <LinkList campaignId={campaign.id} links={campaignLinks} />
    </div>
  )
}
