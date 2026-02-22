import { auth } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { creatorProfileAssets } from "@/db/schema";
import { getSessionCreator } from "@/features/creators/lib/get-session-creator";
import { db } from "@/shared/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { creatorId, key, filename, mimeType, sizeBytes, assetType } = await request.json();

    if (!creatorId || !key || !filename || !mimeType || sizeBytes == null || !assetType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { creator } = await getSessionCreator(userId);
    if (!creator || creator.id !== creatorId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [asset] = await db
      .insert(creatorProfileAssets)
      .values({
        creatorId,
        r2Key: key,
        filename,
        mimeType,
        sizeBytes: Number(sizeBytes),
        assetType,
      })
      .returning({ id: creatorProfileAssets.id });

    return NextResponse.json({ assetId: asset.id });
  } catch (error) {
    console.error("Creator profile complete error:", error);
    return NextResponse.json({ error: "Failed to record upload" }, { status: 500 });
  }
}
