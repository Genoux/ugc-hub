import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { eq } from "drizzle-orm";
import { creatorPortfolioAssets } from "@/db/schema";
import { R2_BUCKET_NAME, r2Client } from "@/features/uploads/lib/r2-client";
import { db } from "@/shared/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ assetId: string }> },
) {
  try {
    const { assetId } = await params;

    const asset = await db.query.creatorPortfolioAssets.findFirst({
      where: eq(creatorPortfolioAssets.id, assetId),
    });

    if (!asset) {
      return Response.json({ error: "Asset not found" }, { status: 404 });
    }

    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: asset.r2Key,
    });

    const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });

    return Response.json(
      { url: signedUrl },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      },
    );
  } catch (error) {
    console.error("Creator portfolio asset URL error:", error);
    return Response.json({ error: "Failed to get asset URL" }, { status: 500 });
  }
}
