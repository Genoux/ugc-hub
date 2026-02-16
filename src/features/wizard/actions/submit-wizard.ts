"use server";

import { eq } from "drizzle-orm";
import { creatorFolders, creatorSubmissions, submissions } from "@/db/schema";
import { db } from "@/shared/lib/db";

// Note: This now handles creator upload flow via uploadToken
export async function submitWizard(data: {
  token: string;
  creatorName: string;
  creatorEmail: string;
}) {
  // Find submission by uploadToken
  const submission = await db.query.submissions.findFirst({
    where: eq(submissions.uploadToken, data.token),
  });

  if (!submission) {
    throw new Error("Submission not found");
  }

  if (submission.status !== "active") {
    throw new Error("Submission is not active");
  }

  // TODO: Create or find creator from creators table using clerk integration
  // For now, we'll create a placeholder creator folder
  // This will be properly implemented when we add the creator profile wizard

  // Create a creator folder for this submission
  const [folder] = await db
    .insert(creatorFolders)
    .values({
      submissionId: submission.id,
      creatorId: "00000000-0000-0000-0000-000000000000", // Placeholder - will be replaced with actual creator ID
      collaborationStatus: "active",
    })
    .returning();

  // Create first upload batch
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
