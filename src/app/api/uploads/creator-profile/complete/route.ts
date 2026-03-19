import { randomUUID } from "node:crypto";
import { auth } from "@clerk/nextjs/server";
import { eq, sql } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { creators } from "@/db/schema";
import type { PortfolioVideoEntry } from "@/entities/creator/types";
import { getSessionCreator } from "@/features/creators/lib/get-session-creator";
import { MAX_PORTFOLIO_VIDEOS } from "@/features/creators/lib/onboarding-utils";
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
    const entry: PortfolioVideoEntry = {
      id: assetId,
      r2Key: key,
      filename,
      mimeType,
      sizeBytes: Number(sizeBytes),
    };

    const result = await db.transaction(async (tx) => {
      // Lock the row so concurrent uploads can't both slip past the limit check
      const [row] = await tx
        .select({ portfolioVideos: creators.portfolioVideos })
        .from(creators)
        .where(eq(creators.id, creatorId))
        .for("update");

      const existing = (row?.portfolioVideos ?? []) as PortfolioVideoEntry[];

      if (existing.length >= MAX_PORTFOLIO_VIDEOS) {
        return { error: "Portfolio video limit reached", status: 409 } as const;
      }

      if (existing.some((v) => v.r2Key === key)) {
        return { error: "Duplicate video", status: 409 } as const;
      }

      await tx
        .update(creators)
        .set({
          portfolioVideos: sql`COALESCE(${creators.portfolioVideos}, '[]'::jsonb) || ${JSON.stringify([entry])}::jsonb`,
        })
        .where(eq(creators.id, creatorId));

      return { assetId } as const;
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ assetId: result.assetId });
  } catch (error) {
    console.error("Creator profile complete error:", error);
    return NextResponse.json({ error: "Failed to record upload" }, { status: 500 });
  }
}
