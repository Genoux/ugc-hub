'use server'

import { db } from '@/shared/lib/db'
import { links, submissions } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function submitWizard(data: {
  token: string
  creatorName: string
  creatorEmail: string
  creatorNotes?: string
}) {
  const link = await db.query.links.findFirst({
    where: eq(links.token, data.token),
  })

  if (!link) {
    throw new Error('Link not found')
  }

  if (link.status !== 'active') {
    throw new Error('Link is not active')
  }

  if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
    throw new Error('Link has expired')
  }

  const [submission] = await db.insert(submissions).values({
    campaignId: link.campaignId,
    linkId: link.id,
    creatorName: data.creatorName,
    creatorEmail: data.creatorEmail,
    creatorNotes: data.creatorNotes || null,
    status: 'pending',
  }).returning()

  await db.update(links)
    .set({ status: 'used' })
    .where(eq(links.id, link.id))

  revalidatePath(`/campaigns/${link.campaignId}`)
  return submission
}
