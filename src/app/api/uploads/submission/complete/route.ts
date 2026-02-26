import { CompleteMultipartUploadCommand } from "@aws-sdk/client-s3";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { assets, submissions } from "@/db/schema";
import { getSessionCreator } from "@/features/creators/lib/get-session-creator";
import { R2_BUCKET_NAME, r2Client } from "@/features/uploads/lib/r2-client";
import { db } from "@/shared/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { creator } = await getSessionCreator(userId);
    if (!creator) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { uploadId, key, parts, submissionId, filename, mimeType, sizeBytes } =
      await request.json();

    const submission = await db.query.submissions.findFirst({
      where: eq(submissions.id, submissionId),
      with: { collaboration: { columns: { creatorId: true, projectId: true } } },
    });
    if (!submission?.collaboration || submission.collaboration.creatorId !== creator.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const expectedPrefix = `projects/${submission.collaboration.projectId}/collaborations/`;
    if (!key.startsWith(expectedPrefix) || !key.includes(`/submissions/${submissionId}/`)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (uploadId && parts) {
      const command = new CompleteMultipartUploadCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: { Parts: parts },
      });

      await r2Client.send(command);
    }

    const [asset] = await db
      .insert(assets)
      .values({
        submissionId,
        r2Key: key,
        filename,
        mimeType,
        sizeBytes,
        uploadStatus: "completed",
      })
      .returning();

    revalidatePath(`/projects/${submission.collaboration.projectId}`);

    return NextResponse.json({ asset });
  } catch (error) {
    console.error("Complete upload error:", error);
    return NextResponse.json({ error: "Failed to complete upload" }, { status: 500 });
  }
}
