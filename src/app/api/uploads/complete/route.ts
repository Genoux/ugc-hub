import { CompleteMultipartUploadCommand } from "@aws-sdk/client-s3";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { assets, creatorSubmissions } from "@/db/schema";
import { R2_BUCKET_NAME, r2Client } from "@/features/uploads/lib/r2-client";
import { db } from "@/shared/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const { uploadId, key, parts, submissionId, filename, mimeType, sizeBytes } =
      await request.json();

    if (uploadId && parts) {
      const command = new CompleteMultipartUploadCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: { Parts: parts },
      });

      await r2Client.send(command);
    }

    // Note: submissionId now refers to creator_submissions (upload batches)
    const [asset] = await db
      .insert(assets)
      .values({
        creatorSubmissionId: submissionId,
        r2Key: key,
        filename,
        mimeType,
        sizeBytes,
        uploadStatus: "completed",
      })
      .returning();

    const batch = await db.query.creatorSubmissions.findFirst({
      where: eq(creatorSubmissions.id, submissionId),
      with: {
        creatorFolder: {
          columns: { submissionId: true },
        },
      },
    });

    if (batch?.creatorFolder) {
      revalidatePath(`/submissions/${batch.creatorFolder.submissionId}`);
    }

    return NextResponse.json({ asset });
  } catch (error) {
    console.error("Complete upload error:", error);
    return NextResponse.json({ error: "Failed to complete upload" }, { status: 500 });
  }
}
