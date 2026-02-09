'use server'

import { db } from '@/shared/lib/db'
import { links, submissions } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import type { WizardStepOne } from '../schemas'

export async function submitWizard(token: string, data: WizardStepOne) {
  const link = await db.query.links.findFirst({
    where: and(
      eq(links.token, token),
      eq(links.status, 'active')
    ),
  })

  if (!link) {
    throw new Error('Invalid or expired link')
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

  return submission
}
