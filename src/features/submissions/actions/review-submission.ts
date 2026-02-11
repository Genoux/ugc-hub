"use server";

import { eq } from "drizzle-orm";
import { submissions } from "@/db/schema";
import { db } from "@/shared/lib/db";

export async function approveSubmission(submissionId: string) {
  const [submission] = await db
    .update(submissions)
    .set({ status: "approved", reviewedAt: new Date() })
    .where(eq(submissions.id, submissionId))
    .returning();

  return submission;
}

export async function rejectSubmission(submissionId: string) {
  const [submission] = await db
    .update(submissions)
    .set({ status: "rejected", reviewedAt: new Date() })
    .where(eq(submissions.id, submissionId))
    .returning();

  return submission;
}
