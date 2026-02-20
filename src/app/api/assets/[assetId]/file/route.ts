import { GetObjectCommand } from "@aws-sdk/client-s3";
import { eq } from "drizzle-orm";
import { submissionAssets } from "@/db/schema";
import { R2_BUCKET_NAME, r2Client } from "@/features/uploads/lib/r2-client";
import { db } from "@/shared/lib/db";

/**
 * Streams the asset with Content-Disposition: attachment so the browser downloads instead of opening.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ assetId: string }> }) {
  const { assetId } = await params;

  const asset = await db.query.submissionAssets.findFirst({
    where: eq(submissionAssets.id, assetId),
  });

  if (!asset) {
    return new Response(null, { status: 404 });
  }

  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: asset.r2Key,
  });

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
