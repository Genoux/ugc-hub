import { z } from 'zod'

export const createLinkSchema = z.object({
  campaignId: z.string().uuid(),
  expiresAt: z.date().optional(),
})

export type CreateLink = z.infer<typeof createLinkSchema>
