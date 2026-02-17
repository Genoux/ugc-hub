"use server";

import { eq } from "drizzle-orm";
import { creatorFolders, creatorSubmissions, creators, submissions } from "@/db/schema";
import { db } from "@/shared/lib/db";

export async function submitWizard(data: {
  token: string;
  creatorName: string;
  creatorEmail: string;
}) {
  const submission = await db.query.submissions.findFirst({
    where: eq(submissions.uploadToken, data.token),
  });

  if (!submission) throw new Error("Submission not found");
  if (submission.status !== "active") throw new Error("Submission is not active");

  let creator = await db.query.creators.findFirst({
    where: eq(creators.email, data.creatorEmail),
    columns: { id: true },
  });

  if (!creator) {
    const [inserted] = await db
      .insert(creators)
      .values({
        email: data.creatorEmail,
        fullName: data.creatorName,
        source: "submission_link",
        status: "applicant",
      })
      .returning({ id: creators.id });
    if (!inserted) throw new Error("Failed to create creator");
    creator = inserted;
  }

  const [folder] = await db
    .insert(creatorFolders)
    .values({
      submissionId: submission.id,
      creatorId: creator.id,
      collaborationStatus: "active",
    })
    .returning();

  const [batch] = await db
    .insert(creatorSubmissions)
    .values({
      creatorFolderId: folder.id,
      label: "Submission 1",
      batchNumber: 1,
      isNew: true,
    })
    .returning();

  return { submission, folder, batch };
}
