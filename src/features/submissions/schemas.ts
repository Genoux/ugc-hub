import { z } from "zod";

export const reviewSubmissionSchema = z.object({
  submissionId: z.string().uuid(),
  status: z.enum(["approved", "rejected"]),
});

export type ReviewSubmission = z.infer<typeof reviewSubmissionSchema>;
