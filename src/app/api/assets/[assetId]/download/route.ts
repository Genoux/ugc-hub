import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, R2_BUCKET_NAME } from "@/features/uploads/lib/r2-client";
import { db } from "@/shared/lib/db";
import { assets } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request, { params }: { params: Promise<{ assetId: string }> }) {
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

    return Response.json({ url: signedUrl });
  } catch (error) {
    console.error("Download URL generation error:", error);
    return Response.json({ error: "Failed to generate download URL" }, { status: 500 });
  }
}
