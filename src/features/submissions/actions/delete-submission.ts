"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { submissions } from "@/db/schema";
import { db } from "@/shared/lib/db";

export async function deleteSubmission(submissionId: string) {
  const [submission] = await db
    .delete(submissions)
    .where(eq(submissions.id, submissionId))
    .returning();

  if (submission) {
    revalidatePath(`/campaigns/${submission.campaignId}`);
  }

  return submission;
}
