import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { eq } from "drizzle-orm";
import { assets } from "@/db/schema";
import { R2_BUCKET_NAME, r2Client } from "@/features/uploads/lib/r2-client";
import { db } from "@/shared/lib/db";

export async function GET(_request: Request, { params }: { params: Promise<{ assetId: string }> }) {
  try {
    const { assetId } = await params;

    const asset = await db.query.assets.findFirst({
      where: eq(assets.id, assetId),
    });

    if (!asset) {
      return Response.json({ error: "Asset not found" }, { status: 404 });
    }

    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: asset.r2Key,
    });

    const signedUrl = await getSignedUrl(r2Client, command, {
      expiresIn: 3600,
    });

    return Response.json(
      { url: signedUrl },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      },
    );
  } catch (error) {
    console.error("Download URL generation error:", error);
    return Response.json({ error: "Failed to generate download URL" }, { status: 500 });
  }
}
