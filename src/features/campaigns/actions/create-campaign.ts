'use server'

import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { campaignSchema } from '../schemas'
import { db } from '@/shared/lib/db'
import { campaigns } from '@/db/schema'

export async function createCampaign(input: z.infer<typeof campaignSchema>) {
  const { isAuthenticated, userId } = await auth()
  if (!isAuthenticated) throw new Error('User not found')

  const data = campaignSchema.parse(input)

  const [campaign] = await db.insert(campaigns).values({
    ...data,
    userId,
    status: 'draft',
  }).returning()

  revalidatePath('/campaigns')
  return campaign
}
