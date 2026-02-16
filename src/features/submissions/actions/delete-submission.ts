"use server";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { submissions } from "@/db/schema";
import { db } from "@/shared/lib/db";

export async function deleteSubmission(submissionId: string) {
  const { isAuthenticated } = await auth();
  if (!isAuthenticated) throw new Error("Unauthorized");

  // Middleware already checked domain
  const submission = await db.query.submissions.findFirst({
    where: eq(submissions.id, submissionId),
    columns: { id: true },
  });

  if (!submission) return null;

  await db.delete(submissions).where(eq(submissions.id, submissionId));
  return submission;
}
