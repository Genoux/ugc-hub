import { z } from "zod";

export const campaignSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
assetRequirements: z.object({
    acceptedTypes: z.array(z.string()),
    maxFiles: z.number().int().min(1).max(50),
    maxFileSize: z.number().int(),
  }),
});

export type Campaign = z.infer<typeof campaignSchema>;
