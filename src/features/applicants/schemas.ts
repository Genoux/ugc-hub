import { z } from "zod";

export const approveApplicantSchema = z.object({
  creatorId: z.string().uuid(),
});

export const rejectApplicantSchema = z.object({
  creatorId: z.string().uuid(),
});

export const directInviteSchema = z.object({
  email: z.string().email(),
});

export type ApproveApplicantInput = z.infer<typeof approveApplicantSchema>;
export type RejectApplicantInput = z.infer<typeof rejectApplicantSchema>;
export type DirectInviteInput = z.infer<typeof directInviteSchema>;
