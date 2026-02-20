import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { creatorPortfolioAssets } from "@/db/schema";
import { requireAdmin } from "@/shared/lib/auth";
import { db } from "@/shared/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAdmin();
    const { creatorFolderId, creatorId, key, filename, mimeType, sizeBytes } = await request.json();

    if (!creatorFolderId || !creatorId || !key || !filename || !mimeType || sizeBytes == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [asset] = await db
      .insert(creatorPortfolioAssets)
      .values({
        creatorFolderId,
        creatorId,
        r2Key: key,
        filename,
        mimeType,
        sizeBytes: Number(sizeBytes),
        uploadedBy: userId,
      })
      .returning();

    return NextResponse.json({ asset });
  } catch (error) {
    console.error("Portfolio complete error:", error);
    return NextResponse.json({ error: "Failed to complete upload" }, { status: 500 });
  }
}
