import { db } from '@/shared/lib/db'
import { links, campaigns } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { WizardShell } from '@/features/wizard/components/wizard-shell'

export default async function SubmitPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const link = await db.query.links.findFirst({
    where: eq(links.token, token),
  })

  if (!link) {
    notFound()
  }

  if (link.status !== 'active') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Link Not Available</h1>
          <p className="mt-2 text-gray-600">
            This link has been {link.status === 'used' ? 'used' : link.status}.
          </p>
        </div>
      </div>
    )
  }

  if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Link Expired</h1>
          <p className="mt-2 text-gray-600">This submission link has expired.</p>
        </div>
      </div>
    )
  }

  const campaign = await db.query.campaigns.findFirst({
    where: eq(campaigns.id, link.campaignId),
  })

  if (!campaign) {
    notFound()
  }

  return <WizardShell token={token} campaignName={campaign.name} />
}
