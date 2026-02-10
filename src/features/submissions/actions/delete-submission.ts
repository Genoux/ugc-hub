"use server";

import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { links, submissions } from "@/db/schema";
import { R2_BUCKET_NAME, r2Client } from "@/features/uploads/lib/r2-client";
import { db } from "@/shared/lib/db";

export async function deleteSubmission(submissionId: string) {
  const submission = await db.query.submissions.findFirst({
    where: eq(submissions.id, submissionId),
    with: {
      assets: true,
    },
  });

  if (!submission) {
    return null;
  }

  // Delete files from R2 storage first (batch delete for efficiency)
  if (submission.assets && submission.assets.length > 0) {
    try {
      await r2Client.send(
        new DeleteObjectsCommand({
          Bucket: R2_BUCKET_NAME,
          Delete: {
            Objects: submission.assets.map((asset) => ({ Key: asset.r2Key })),
          },
        }),
      );
    } catch (error) {
      console.error("Failed to delete files from R2:", error);
      // Continue with database deletion even if R2 deletion fails
      // This prevents the submission from being stuck in a partially deleted state
    }
  }

  // Delete database records (cascade will handle assets table)
  await db.delete(links).where(eq(links.id, submission.linkId));
  await db.delete(submissions).where(eq(submissions.id, submissionId));

  revalidatePath(`/campaigns/${submission.campaignId}`);

  return submission;
}
