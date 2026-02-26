import { randomBytes } from "node:crypto";
import {
  CreateMultipartUploadCommand,
  PutObjectCommand,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { collaborations, submissions } from "@/db/schema";
import { getSessionCreator } from "@/features/creators/lib/get-session-creator";
import { R2_BUCKET_NAME, r2Client } from "@/features/uploads/lib/r2-client";
import { UPLOAD_CONFIG } from "@/features/uploads/lib/upload-config";
import { db } from "@/shared/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function sanitizeFilename(input: unknown): string {
  const s = String(input ?? "").replace(/^.*[/\\]/, "").trim();
  const safe = s.replace(/[^a-zA-Z0-9._-]/g, "_");
  return safe.length > 0 ? safe : "file";
}

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

    const { filename, contentType, fileSize, projectId, creatorCollaborationId, submissionId } =
      await request.json();

    if (!UPLOAD_CONFIG.allowedMimeTypes.includes(contentType)) {
      return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
    }

    if (fileSize > UPLOAD_CONFIG.maxFileSize) {
      return NextResponse.json({ error: "File size exceeds limit" }, { status: 400 });
    }

    const collaboration = await db.query.collaborations.findFirst({
      where: eq(collaborations.id, creatorCollaborationId),
      columns: { id: true, creatorId: true, projectId: true },
    });
    if (!collaboration || collaboration.creatorId !== creator.id || collaboration.projectId !== projectId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const submission = await db.query.submissions.findFirst({
      where: eq(submissions.id, submissionId),
      columns: { id: true, collaborationId: true },
    });
    if (!submission || submission.collaborationId !== creatorCollaborationId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const safeFilename = sanitizeFilename(filename);
    const folder = `projects/${projectId}/collaborations/${creatorCollaborationId}/submissions/${submissionId}`;
    const key = `${folder}/${randomBytes(16).toString("hex")}-${safeFilename}`;

    if (fileSize > UPLOAD_CONFIG.chunkSize) {
      const { UploadId: uploadId } = await r2Client.send(
        new CreateMultipartUploadCommand({
          Bucket: R2_BUCKET_NAME,
          Key: key,
          ContentType: contentType,
        }),
      );

      const numParts = Math.ceil(fileSize / UPLOAD_CONFIG.chunkSize);

      const partUrls = await Promise.all(
        Array.from({ length: numParts }, (_, i) =>
          getSignedUrl(
            r2Client,
            new UploadPartCommand({
              Bucket: R2_BUCKET_NAME,
              Key: key,
              UploadId: uploadId,
              PartNumber: i + 1,
            }),
            { expiresIn: 3600 },
          ),
        ),
      );

      return NextResponse.json({ uploadId, key, isMultipart: true, partUrls });
    }

    const uploadUrl = await getSignedUrl(
      r2Client,
      new PutObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key, ContentType: contentType }),
      { expiresIn: 3600 },
    );

    return NextResponse.json({ uploadUrl, key, isMultipart: false });
  } catch (error) {
    console.error("Presign error:", error);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}
