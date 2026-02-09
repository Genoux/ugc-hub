import { db } from '@/shared/lib/db'
import { links, campaigns } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { WizardShell } from '@/features/wizard/components/wizard-shell'

export default async function SubmitPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const link = await db.query.links.findFirst({
    where: and(
      eq(links.token, token),
      eq(links.status, 'active')
    ),
  })

  if (!link) {
    notFound()
  }

  const campaign = await db.query.campaigns.findFirst({
    where: eq(campaigns.id, link.campaignId),
  })

  if (!campaign || campaign.status !== 'active') {
    return (
      <div className="rounded-lg bg-white p-8 text-center shadow">
        <h2 className="mb-2 text-2xl font-bold">Campaign Not Available</h2>
        <p className="text-gray-600">This campaign is no longer accepting submissions.</p>
      </div>
    )
  }

  return <WizardShell token={token} campaignName={campaign.name} />
}
