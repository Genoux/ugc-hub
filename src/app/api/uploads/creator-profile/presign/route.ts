import { randomBytes } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { PortfolioVideoEntry } from "@/entities/creator/types";
import { getSessionCreator } from "@/features/creators/lib/get-session-creator";
import { MAX_PORTFOLIO_VIDEOS } from "@/features/creators/lib/onboarding-utils";
import { R2_BUCKET_NAME, r2Client } from "@/features/uploads/lib/r2-client";
import { UPLOAD_SIZE_LIMITS } from "@/shared/lib/constants";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  profile_picture: ["image/jpeg", "image/png", "image/webp"],
  portfolio_video: ["video/mp4", "video/quicktime", "video/webm"],
};

const MAX_FILE_SIZE: Record<string, number> = {
  profile_picture: UPLOAD_SIZE_LIMITS.image,
  portfolio_video: UPLOAD_SIZE_LIMITS.video,
};

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { creatorId, filename, mimeType, fileSize, assetType } = await request.json();

    if (!creatorId || !filename || !mimeType || !assetType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { creator } = await getSessionCreator(userId);
    if (!creator || creator.id !== creatorId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const allowedTypes = ALLOWED_MIME_TYPES[assetType];
    if (!allowedTypes) {
      return NextResponse.json({ error: "Unknown asset type" }, { status: 400 });
    }
    if (!allowedTypes.includes(mimeType)) {
      return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
    }

    if (fileSize > MAX_FILE_SIZE[assetType]) {
      return NextResponse.json({ error: "File size exceeds limit" }, { status: 400 });
    }

    if (assetType === "portfolio_video") {
      const videos = (creator.portfolioVideos ?? []) as PortfolioVideoEntry[];
      if (videos.length >= MAX_PORTFOLIO_VIDEOS) {
        return NextResponse.json({ error: "Portfolio video limit reached" }, { status: 409 });
      }
    }

    // profile_picture: deterministic key so each save overwrites the previous one in R2.
    // portfolio_video: unique key per file, tracked in creator_profile_assets.
    const key =
      assetType === "profile_picture"
        ? `creators/${creatorId}/profile-picture`
        : `creators/${creatorId}/portfolio/${randomBytes(16).toString("hex")}-${filename}`;

    const uploadUrl = await getSignedUrl(
      r2Client,
      new PutObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key, ContentType: mimeType, ContentLength: fileSize }),
      { expiresIn: 3600 },
    );

    return NextResponse.json({ uploadUrl, key });
  } catch (error) {
    console.error("Creator profile presign error:", error);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}
