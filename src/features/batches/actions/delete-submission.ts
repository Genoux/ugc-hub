"use server";

import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { eq } from "drizzle-orm";
import { creatorSubmissions } from "@/db/schema";
import { R2_BUCKET_NAME, r2Client } from "@/features/uploads/lib/r2-client";
import { db } from "@/shared/lib/db";

// Note: Now operates on creator_submissions (upload batches)
export async function deleteSubmission(submissionId: string) {
  const batch = await db.query.creatorSubmissions.findFirst({
    where: eq(creatorSubmissions.id, submissionId),
    with: {
      assets: true,
    },
  });

  if (!batch) {
    return null;
  }

  if (batch.assets && batch.assets.length > 0) {
    try {
      await r2Client.send(
        new DeleteObjectsCommand({
          Bucket: R2_BUCKET_NAME,
          Delete: {
            Objects: batch.assets.map((asset) => ({ Key: asset.r2Key })),
          },
        }),
      );
    } catch (error) {
      console.error("Failed to delete files from R2:", error);
      // Continue with database deletion even if R2 deletion fails
    }
  }

  // Delete database records (cascade will handle assets table)
  await db.delete(creatorSubmissions).where(eq(creatorSubmissions.id, submissionId));

  return batch;
}
