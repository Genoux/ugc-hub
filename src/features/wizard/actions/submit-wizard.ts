"use server";

import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { creatorFolders, creatorSubmissions, creators, submissions } from "@/db/schema";
import { db } from "@/shared/lib/db";

export async function submitWizard(data: { token: string; creatorId: string }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const submission = await db.query.submissions.findFirst({
    where: eq(submissions.uploadToken, data.token),
  });

  if (!submission) throw new Error("Submission not found");
  if (submission.status !== "active") throw new Error("Submission is not active");

  const creator = await db.query.creators.findFirst({
    where: eq(creators.id, data.creatorId),
    columns: { id: true, clerkUserId: true },
  });

  if (!creator) throw new Error("Creator not found");
  if (creator.clerkUserId !== userId) throw new Error("Forbidden");

  // Reuse existing folder for this creator+project; create one on first submission
  let folder = await db.query.creatorFolders.findFirst({
    where: and(
      eq(creatorFolders.submissionId, submission.id),
      eq(creatorFolders.creatorId, creator.id),
    ),
    with: { creatorSubmissions: { columns: { batchNumber: true } } },
  });

  if (!folder) {
    const [inserted] = await db
      .insert(creatorFolders)
      .values({ submissionId: submission.id, creatorId: creator.id, collaborationStatus: "active" })
      .returning();
    folder = { ...inserted, creatorSubmissions: [] };
  }

  const nextBatchNumber = folder.creatorSubmissions.length + 1;

  const [batch] = await db
    .insert(creatorSubmissions)
    .values({
      creatorFolderId: folder.id,
      label: `Submission ${nextBatchNumber}`,
      batchNumber: nextBatchNumber,
      isNew: true,
    })
    .returning();

  return { submission, folder, batch };
}
