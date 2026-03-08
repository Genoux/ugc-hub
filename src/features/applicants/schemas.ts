import { z } from "zod";

export const applyFormSchema = z.object({
  fullName: z.string().min(1, "Required"),
  email: z.email("Invalid email"),
  country: z.string().min(1, "Required"),
  languages: z.array(z.string()).min(1, "Select at least one language"),
  instagram_handle: z.string().optional(),
  tiktok_handle: z.string().optional(),
  youtube_handle: z.string().optional(),
  portfolioUrl: z.string().url("Invalid URL").or(z.literal("")).optional(),
});

export type ApplyFormInput = z.infer<typeof applyFormSchema>;

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
