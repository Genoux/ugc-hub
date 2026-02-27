import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { assets, collaborations, creators, submissions } from "@/db/schema";
import { getR2SignedUrl, r2JsonResponse } from "@/features/uploads/lib/r2-serve";
import { db } from "@/shared/lib/db";
import { env } from "@/shared/lib/env";

const ALLOWED_DOMAIN = env.ALLOWED_DOMAIN;

export async function GET(_request: Request, { params }: { params: Promise<{ assetId: string }> }) {
  try {
    const { userId, sessionClaims } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { assetId } = await params;

    const rows = await db
      .select({
        r2Key: assets.r2Key,
        ownerClerkUserId: creators.clerkUserId,
      })
      .from(assets)
      .innerJoin(submissions, eq(submissions.id, assets.submissionId))
      .innerJoin(collaborations, eq(collaborations.id, submissions.collaborationId))
      .innerJoin(creators, eq(creators.id, collaborations.creatorId))
      .where(eq(assets.id, assetId))
      .limit(1);

    if (rows.length === 0) {
      return Response.json({ error: "Asset not found" }, { status: 404 });
    }

    const { r2Key, ownerClerkUserId } = rows[0];

    const email = (sessionClaims?.primaryEmail as string | undefined) ?? "";
    const isAdmin = ALLOWED_DOMAIN ? email.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`) : false;
    const isOwner = ownerClerkUserId === userId;

    if (!isAdmin && !isOwner) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const signedUrl = await getR2SignedUrl(r2Key);
    if (!signedUrl) return Response.json({ error: "Asset not found" }, { status: 404 });
    return r2JsonResponse(signedUrl);
  } catch (error) {
    console.error("Download URL generation error:", error);
    return Response.json({ error: "Failed to generate download URL" }, { status: 500 });
  }
}
