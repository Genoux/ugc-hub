"use server";

import { eq } from "drizzle-orm";
import type { z } from "zod";
import { submissions } from "@/db/schema";
import { db } from "@/shared/lib/db";
import { createLinkSchema } from "../schemas";

// Note: Links are now uploadTokens on submissions table
// This function is kept for backward compatibility
export async function createLink(input: z.infer<typeof createLinkSchema>) {
  const data = createLinkSchema.parse(input);

  // Return the existing submission's uploadToken
  const submission = await db.query.submissions.findFirst({
    where: eq(submissions.id, data.submissionId),
    columns: { id: true, uploadToken: true },
  });

  if (!submission) {
    throw new Error("Submission not found");
  }

  // Return token in link format for backward compatibility
  return {
    id: submission.id,
    token: submission.uploadToken,
    submissionId: data.submissionId,
    status: "active" as const,
    createdAt: new Date(),
    expiresAt: data.expiresAt || null,
  };
}
