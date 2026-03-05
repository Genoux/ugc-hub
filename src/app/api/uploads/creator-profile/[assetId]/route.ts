import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@clerk/nextjs/server";
import { eq, sql } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { creators } from "@/db/schema";
import type { PortfolioVideoEntry } from "@/features/creators/types";
import { getSessionCreator } from "@/features/creators/lib/get-session-creator";
import { R2_BUCKET_NAME, r2Client } from "@/features/uploads/lib/r2-client";
import { db } from "@/shared/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { assetId } = await params;
    const { creator } = await getSessionCreator(userId);
    if (!creator) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const videos = (creator.portfolioVideos ?? []) as PortfolioVideoEntry[];
    const target = videos.find((v) => v.id === assetId);
    if (!target) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    await Promise.all([
      db
        .update(creators)
        .set({
          portfolioVideos: sql`(
            SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
            FROM jsonb_array_elements(COALESCE(${creators.portfolioVideos}, '[]'::jsonb)) elem
            WHERE elem->>'id' != ${assetId}
          )`,
        })
        .where(eq(creators.id, creator.id)),
      r2Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: target.r2Key })),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Creator profile asset delete error:", error);
    return NextResponse.json({ error: "Failed to delete asset" }, { status: 500 });
  }
}
