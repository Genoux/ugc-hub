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

export const directInviteBulkSchema = z.object({
  emails: z.array(z.string().email()).min(1).max(100),
});

export type ApproveApplicantInput = z.infer<typeof approveApplicantSchema>;
export type RejectApplicantInput = z.infer<typeof rejectApplicantSchema>;
export type DirectInviteInput = z.infer<typeof directInviteSchema>;
export type DirectInviteBulkInput = z.infer<typeof directInviteBulkSchema>;
