import { db } from '@/shared/lib/db'
import { links, campaigns } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { WizardShell } from '@/features/wizard/components/wizard-shell'
import { AlertCircle } from 'lucide-react'

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
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="size-12 text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-semibold">Link Not Available</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This link has been {link.status === 'used' ? 'used' : link.status}.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="size-12 text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-semibold">Link Expired</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This submission link has expired.
            </p>
          </div>
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

  return <WizardShell token={token} campaignName={campaign.name} campaignBrief={campaign.brief} />
}
