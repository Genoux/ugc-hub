import { CreateMultipartUploadCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomBytes } from "crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { R2_BUCKET_NAME, r2Client } from "@/features/uploads/lib/r2-client";
import { UPLOAD_CONFIG } from "@/features/uploads/lib/upload-config";

export async function POST(request: NextRequest) {
  try {
    const { filename, contentType, fileSize, submissionId } = await request.json();

    if (!UPLOAD_CONFIG.allowedMimeTypes.includes(contentType)) {
      return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
    }

    if (fileSize > UPLOAD_CONFIG.maxFileSize) {
      return NextResponse.json({ error: "File size exceeds limit" }, { status: 400 });
    }

    const folder = submissionId ? `submissions/${submissionId}` : "uploads";
    const key = `${folder}/${randomBytes(16).toString("hex")}-${filename}`;

    if (fileSize > UPLOAD_CONFIG.chunkSize) {
      const multipartCommand = new CreateMultipartUploadCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        ContentType: contentType,
      });

      const multipartUpload = await r2Client.send(multipartCommand);

      return NextResponse.json({
        uploadId: multipartUpload.UploadId,
        key,
        isMultipart: true,
      });
    } else {
      const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        ContentType: contentType,
      });

      const signedUrl = await getSignedUrl(r2Client, command, {
        expiresIn: 3600,
      });

      return NextResponse.json({
        uploadUrl: signedUrl,
        key,
        isMultipart: false,
      });
    }
  } catch (error) {
    console.error("Presign error:", error);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}
