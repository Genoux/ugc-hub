'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/shared/lib/db'
import { links } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function revokeLink(linkId: string) {
  const [link] = await db.update(links)
    .set({ status: 'revoked' })
    .where(eq(links.id, linkId))
    .returning()

  if (link) {
    revalidatePath(`/campaigns/${link.campaignId}`)
  }
  
  return link
}
