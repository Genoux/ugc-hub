import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { creators } from "@/db/schema";
import { R2_BUCKET_NAME, r2Client } from "@/features/uploads/lib/r2-client";
import { db } from "@/shared/lib/db";

const ALLOWED_DOMAIN = process.env.ALLOWED_DOMAIN;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ creatorId: string }> },
) {
  try {
    const { creatorId } = await params;

    const creator = await db.query.creators.findFirst({
      where: eq(creators.id, creatorId),
      columns: { id: true, profilePhoto: true, clerkUserId: true, email: true },
    });

    if (!creator || !creator.profilePhoto) {
      return new Response(null, { status: 404 });
    }

    const { userId } = await auth();
    if (!userId) {
      return new Response(null, { status: 401 });
    }

    const isOwner = creator.clerkUserId === userId;
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const email = user.primaryEmailAddress?.emailAddress ?? "";
    const isAdmin = ALLOWED_DOMAIN && email.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`);

    if (!isOwner && !isAdmin) {
      return new Response(null, { status: 403 });
    }

    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: creator.profilePhoto,
    });

    const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
    return Response.redirect(signedUrl, 302);
  } catch (error) {
    console.error("Creator profile photo error:", error);
    return new Response(null, { status: 500 });
  }
}
