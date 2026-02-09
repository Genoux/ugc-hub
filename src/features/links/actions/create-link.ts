'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/shared/lib/db'
import { links } from '@/db/schema'
import { createLinkSchema } from '../schemas'
import { z } from 'zod'
import { randomBytes } from 'crypto'

function generateToken(): string {
  return randomBytes(16).toString('hex')
}

export async function createLink(input: z.infer<typeof createLinkSchema>) {
  const data = createLinkSchema.parse(input)
  const token = generateToken()

  const [link] = await db.insert(links).values({
    campaignId: data.campaignId,
    token,
    expiresAt: data.expiresAt || null,
    status: 'active',
  }).returning()

  revalidatePath(`/campaigns/${data.campaignId}`)
  return link
}
