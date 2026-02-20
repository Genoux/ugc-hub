import { z } from "zod";
import { OVERALL_RATING_TIERS, RATING_TIERS } from "@/features/creators/constants";

export const collaborationRatingsSchema = z.object({
  visual_quality: z.enum(RATING_TIERS),
  acting_line_delivery: z.enum(RATING_TIERS),
  reliability_speed: z.enum(RATING_TIERS),
});

export const closeCollaborationSchema = z.object({
  folderId: z.string().uuid(),
  creatorId: z.string().uuid(),
  submissionName: z.string().min(1),
  overallRating: z.enum(OVERALL_RATING_TIERS),
  ratings: collaborationRatingsSchema,
  piecesOfContent: z.number().int().min(1),
  totalPaid: z.number().min(0), // In dollars from UI, converted to cents in action
  notes: z.string().optional(),
});

export type CollaborationRatingsInput = z.infer<typeof collaborationRatingsSchema>;
export type CloseCollaborationInput = z.infer<typeof closeCollaborationSchema>;
