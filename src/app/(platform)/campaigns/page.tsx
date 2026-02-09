import { db } from '@/shared/lib/db'
import { campaigns } from '@/db/schema'
import { getCurrentUser } from '@/shared/lib/auth'
import { eq } from 'drizzle-orm'
import { CampaignList } from '@/features/campaigns/components/campaign-list'

export default async function CampaignsPage() {
  const user = await getCurrentUser()
  const userCampaigns = await db.query.campaigns.findMany({
    where: eq(campaigns.userId, user.id),
  })

  return <CampaignList campaigns={userCampaigns} />
}
