import { randomBytes } from "node:crypto";
import {
  CreateMultipartUploadCommand,
  PutObjectCommand,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { R2_BUCKET_NAME, r2Client } from "@/features/uploads/lib/r2-client";
import { UPLOAD_CONFIG } from "@/features/uploads/lib/upload-config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const { filename, contentType, fileSize, submissionId, creatorFolderId, batchId } =
      await request.json();

    if (!UPLOAD_CONFIG.allowedMimeTypes.includes(contentType)) {
      return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
    }

    if (fileSize > UPLOAD_CONFIG.maxFileSize) {
      return NextResponse.json({ error: "File size exceeds limit" }, { status: 400 });
    }

    const folder = `submissions/${submissionId}/creators/${creatorFolderId}/batches/${batchId}`;
    const key = `${folder}/${randomBytes(16).toString("hex")}-${filename}`;

    if (fileSize > UPLOAD_CONFIG.chunkSize) {
      const { UploadId: uploadId } = await r2Client.send(
        new CreateMultipartUploadCommand({
          Bucket: R2_BUCKET_NAME,
          Key: key,
          ContentType: contentType,
        }),
      );

      const numParts = Math.ceil(fileSize / UPLOAD_CONFIG.chunkSize);

      // Presign every part URL so the browser can upload directly to R2 in parallel
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
