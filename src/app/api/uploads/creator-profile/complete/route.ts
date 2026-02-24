import { randomUUID } from "node:crypto";
import { auth } from "@clerk/nextjs/server";
import { eq, sql } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { creators } from "@/db/schema";
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

    const { creatorId, key, filename, mimeType, sizeBytes } = await request.json();

    if (!creatorId || !key || !filename || !mimeType || sizeBytes == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { creator } = await getSessionCreator(userId);
    if (!creator || creator.id !== creatorId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const assetId = randomUUID();
    const entry = { id: assetId, r2Key: key, filename, mimeType, sizeBytes: Number(sizeBytes) };

    await db
      .update(creators)
      .set({
        portfolioVideos: sql`COALESCE(${creators.portfolioVideos}, '[]'::jsonb) || ${JSON.stringify([entry])}::jsonb`,
      })
      .where(eq(creators.id, creatorId));

    return NextResponse.json({ assetId });
  } catch (error) {
    console.error("Creator profile complete error:", error);
    return NextResponse.json({ error: "Failed to record upload" }, { status: 500 });
  }
}
