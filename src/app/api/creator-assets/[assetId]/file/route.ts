import { GetObjectCommand } from "@aws-sdk/client-s3";
import { eq } from "drizzle-orm";
import { creatorPortfolioAssets, creatorProfileAssets } from "@/db/schema";
import { R2_BUCKET_NAME, r2Client } from "@/features/uploads/lib/r2-client";
import { requireAdmin } from "@/shared/lib/auth";
import { db } from "@/shared/lib/db";

export async function GET(_request: Request, { params }: { params: Promise<{ assetId: string }> }) {
  await requireAdmin();

  const { assetId } = await params;

  const asset =
    (await db.query.creatorProfileAssets.findFirst({
      where: eq(creatorProfileAssets.id, assetId),
    })) ??
    (await db.query.creatorPortfolioAssets.findFirst({
      where: eq(creatorPortfolioAssets.id, assetId),
    }));

  if (!asset) {
    return new Response(null, { status: 404 });
  }

  const command = new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: asset.r2Key });
  const result = await r2Client.send(command);
  const body = result.Body;

  if (!body) {
    return new Response(null, { status: 404 });
  }

  const bytes = await body.transformToByteArray();
  const disposition = `attachment; filename*=UTF-8''${encodeURIComponent(asset.filename)}`;

  return new Response(new Blob([new Uint8Array(bytes)]), {
    headers: {
      "Content-Type": asset.mimeType,
      "Content-Disposition": disposition,
    },
  });
}
