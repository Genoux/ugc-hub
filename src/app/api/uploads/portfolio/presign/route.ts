import { randomBytes } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { R2_BUCKET_NAME, r2Client } from "@/features/uploads/lib/r2-client";
import { UPLOAD_CONFIG } from "@/features/uploads/lib/upload-config";
import { requireAdmin } from "@/shared/lib/auth";
import { UPLOAD_SIZE_LIMITS } from "@/shared/lib/constants";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const { creatorCollaborationId, creatorId, filename, mimeType, fileSize } =
      await request.json();

    if (!creatorCollaborationId || !creatorId || !filename || !mimeType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!UPLOAD_CONFIG.allowedMimeTypes.includes(mimeType)) {
      return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
    }

    if (fileSize > UPLOAD_SIZE_LIMITS.video) {
      return NextResponse.json({ error: "File size exceeds limit" }, { status: 400 });
    }

    const key = `creators/${creatorId}/portfolio/${creatorCollaborationId}/${randomBytes(16).toString("hex")}-${filename}`;

    const uploadUrl = await getSignedUrl(
      r2Client,
      new PutObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key, ContentType: mimeType }),
      { expiresIn: 3600 },
    );

    return NextResponse.json({ uploadUrl, key });
  } catch (error) {
    console.error("Portfolio presign error:", error);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}
