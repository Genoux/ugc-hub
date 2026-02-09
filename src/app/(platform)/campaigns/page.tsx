import { db } from '@/shared/lib/db'
import { campaigns } from '@/db/schema'
import { getCurrentUser } from '@/shared/lib/auth'
import { eq } from 'drizzle-orm'

export default async function CampaignsPage() {
  const user = await getCurrentUser()
  const userCampaigns = await db.query.campaigns.findMany({
    where: eq(campaigns.userId, user.id),
  })

  return (
    <div>
      <h1>Campaigns</h1>
      <ul>
        {userCampaigns.map(c => (
          <li key={c.id}>{c.name}</li>
        ))}
      </ul>
    </div>
  )
}
