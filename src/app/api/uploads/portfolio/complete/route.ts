import { randomUUID } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { collaborations } from "@/db/schema";
import { requireAdmin } from "@/shared/lib/auth";
import { db } from "@/shared/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAdmin();
    const { collaborationId, key, filename, mimeType, sizeBytes } = await request.json();

    if (!collaborationId || !key || !filename || !mimeType || sizeBytes == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const assetId = randomUUID();
    const entry = {
      id: assetId,
      r2Key: key,
      filename,
      mimeType,
      sizeBytes: Number(sizeBytes),
      uploadedBy: userId,
    };

    await db
      .update(collaborations)
      .set({
        highlights: sql`COALESCE(${collaborations.highlights}, '[]'::jsonb) || ${JSON.stringify([entry])}::jsonb`,
      })
      .where(eq(collaborations.id, collaborationId));

    return NextResponse.json({ asset: entry });
  } catch (error) {
    console.error("Portfolio complete error:", error);
    return NextResponse.json({ error: "Failed to complete upload" }, { status: 500 });
  }
}
