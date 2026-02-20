import { randomBytes } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { creators } from "@/db/schema";
import { R2_BUCKET_NAME, r2Client } from "@/features/uploads/lib/r2-client";
import { UPLOAD_CONFIG } from "@/features/uploads/lib/upload-config";
import { db } from "@/shared/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { creatorId, filename, mimeType, fileSize, assetType } = await request.json();

    if (!creatorId || !filename || !mimeType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const creator = await db.query.creators.findFirst({
      where: eq(creators.id, creatorId),
      columns: { id: true, clerkUserId: true, email: true },
    });

    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    if (creator.clerkUserId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(mimeType)) {
      return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
    }

    if (fileSize > UPLOAD_CONFIG.maxFileSize) {
      return NextResponse.json({ error: "File size exceeds limit" }, { status: 400 });
    }

    const type = assetType === "profile_picture" ? "profile_picture" : "other";
    const key = `creators/${creatorId}/creator-profile/${type}/${randomBytes(16).toString("hex")}-${filename}`;

    const uploadUrl = await getSignedUrl(
      r2Client,
      new PutObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key, ContentType: mimeType }),
      { expiresIn: 3600 },
    );

    return NextResponse.json({ uploadUrl, key });
  } catch (error) {
    console.error("Creator profile presign error:", error);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}
