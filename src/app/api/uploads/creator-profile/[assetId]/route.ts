import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { creatorProfileAssets } from "@/db/schema";
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

    const asset = await db.query.creatorProfileAssets.findFirst({
      where: eq(creatorProfileAssets.id, assetId),
      columns: { id: true, creatorId: true, r2Key: true },
    });

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    const { creator } = await getSessionCreator(userId);
    if (!creator || creator.id !== asset.creatorId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await Promise.all([
      db.delete(creatorProfileAssets).where(eq(creatorProfileAssets.id, assetId)),
      r2Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: asset.r2Key })),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Creator profile asset delete error:", error);
    return NextResponse.json({ error: "Failed to delete asset" }, { status: 500 });
  }
}
