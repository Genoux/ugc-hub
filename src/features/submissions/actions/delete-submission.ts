"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { links, submissions } from "@/db/schema";
import { db } from "@/shared/lib/db";

export async function deleteSubmission(submissionId: string) {
  const submission = await db.query.submissions.findFirst({
    where: eq(submissions.id, submissionId),
  });

  if (!submission) {
    return null;
  }

  await db.delete(links).where(eq(links.id, submission.linkId));

  await db.delete(submissions).where(eq(submissions.id, submissionId));

  revalidatePath(`/campaigns/${submission.campaignId}`);

  return submission;
}
