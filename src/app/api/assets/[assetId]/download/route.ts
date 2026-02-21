import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import {
  creatorCollaborations,
  creatorSubmissions,
  creators,
  submissionAssets,
} from "@/db/schema";
import { R2_BUCKET_NAME, r2Client } from "@/features/uploads/lib/r2-client";
import { db } from "@/shared/lib/db";

const ALLOWED_DOMAIN = process.env.ALLOWED_DOMAIN;

export async function GET(_request: Request, { params }: { params: Promise<{ assetId: string }> }) {
  try {
    const { userId, sessionClaims } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { assetId } = await params;

    const rows = await db
      .select({
        r2Key: submissionAssets.r2Key,
        ownerClerkUserId: creators.clerkUserId,
      })
      .from(submissionAssets)
      .innerJoin(creatorSubmissions, eq(creatorSubmissions.id, submissionAssets.creatorSubmissionId))
      .innerJoin(
        creatorCollaborations,
        eq(creatorCollaborations.id, creatorSubmissions.creatorCollaborationId),
      )
      .innerJoin(creators, eq(creators.id, creatorCollaborations.creatorId))
      .where(eq(submissionAssets.id, assetId))
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

    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: r2Key,
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
