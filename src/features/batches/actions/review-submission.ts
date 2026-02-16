"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { creatorSubmissions } from "@/db/schema";
import { db } from "@/shared/lib/db";

// Note: These now operate on creator_submissions (upload batches), not top-level submissions
export async function approveSubmission(submissionId: string) {
  // Mark batch as reviewed
  const [batch] = await db
    .update(creatorSubmissions)
    .set({ isNew: false, reviewedAt: new Date(), reviewedBy: "system" })
    .where(eq(creatorSubmissions.id, submissionId))
    .returning();

  // TODO: Revalidate proper paths once UI is updated
  return batch;
}

export async function rejectSubmission(submissionId: string) {
  // For now, just mark as reviewed (no rejected status on batches yet)
  const [batch] = await db
    .update(creatorSubmissions)
    .set({ isNew: false, reviewedAt: new Date(), reviewedBy: "system" })
    .where(eq(creatorSubmissions.id, submissionId))
    .returning();

  // TODO: Revalidate proper paths once UI is updated
  return batch;
}
