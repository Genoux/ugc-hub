import { sql } from "drizzle-orm";
import { collaborations, creators } from "@/db/schema";
import type { CollaborationHighlight, PortfolioVideoEntry } from "@/features/creators/constants";
import { getR2SignedUrl, r2JsonResponse } from "@/features/uploads/lib/r2-serve";
import { db } from "@/shared/lib/db";

export async function GET(_request: Request, { params }: { params: Promise<{ assetId: string }> }) {
  try {
    const { assetId } = await params;

    const creatorWithVideo = await db.query.creators.findFirst({
      where: sql`${creators.portfolioVideos} @> ${JSON.stringify([{ id: assetId }])}::jsonb`,
      columns: { portfolioVideos: true },
    });

    if (creatorWithVideo) {
      const asset = (creatorWithVideo.portfolioVideos as PortfolioVideoEntry[]).find(
        (v) => v.id === assetId,
      );
      if (asset) {
        const url = await getR2SignedUrl(asset.r2Key);
        if (url) return r2JsonResponse(url);
      }
    }

    const collabWithHighlight = await db.query.collaborations.findFirst({
      where: sql`${collaborations.highlights} @> ${JSON.stringify([{ id: assetId }])}::jsonb`,
      columns: { highlights: true },
    });

    if (collabWithHighlight) {
      const asset = (collabWithHighlight.highlights as CollaborationHighlight[]).find(
        (h) => h.id === assetId,
      );
      if (asset) {
        const url = await getR2SignedUrl(asset.r2Key);
        if (url) return r2JsonResponse(url);
      }
    }

    return Response.json({ error: "Asset not found" }, { status: 404 });
  } catch (error) {
    console.error("Asset URL generation error:", error);
    return Response.json({ error: "Failed to get asset URL" }, { status: 500 });
  }
}
