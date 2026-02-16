import { z } from "zod";

export const createLinkSchema = z.object({
  submissionId: z.string().uuid(),
  expiresAt: z.date().optional(),
});

export type CreateLink = z.infer<typeof createLinkSchema>;
