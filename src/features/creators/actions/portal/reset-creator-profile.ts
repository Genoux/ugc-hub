"use server";

import { DeleteObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { creators } from "@/db/schema";
import type { PortfolioVideoEntry } from "@/features/creators/constants";
import { R2_BUCKET_NAME, r2Client } from "@/features/uploads/lib/r2-client";
import { toActionError } from "@/shared/lib/action-error";
import { db } from "@/shared/lib/db";

export async function resetCreatorProfile(creatorId: string) {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("Dev only");
  }

  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const record = await db.query.creators.findFirst({
      where: eq(creators.id, creatorId),
      columns: { clerkUserId: true, email: true, portfolioVideos: true, profilePhoto: true },
    });

    if (!record) throw new Error("Creator profile not found");

    const clerkUser = await (await clerkClient()).users.getUser(userId);
    const userEmail = clerkUser.primaryEmailAddress?.emailAddress?.toLowerCase().trim();
    const isOwner =
      record.clerkUserId === userId ||
      (userEmail !== undefined && record.email?.toLowerCase().trim() === userEmail);
    if (!isOwner) throw new Error("Forbidden");

    const videos = (record.portfolioVideos ?? []) as PortfolioVideoEntry[];
    const r2Deletes: Promise<unknown>[] = [];

    if (videos.length > 0) {
      r2Deletes.push(
        r2Client.send(
          new DeleteObjectsCommand({
            Bucket: R2_BUCKET_NAME,
            Delete: { Objects: videos.map((v) => ({ Key: v.r2Key })) },
          }),
        ),
      );
    }

    if (record.profilePhoto) {
      r2Deletes.push(
        r2Client.send(
          new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: record.profilePhoto }),
        ),
      );
    }

    await Promise.allSettled(r2Deletes);

    await db
      .update(creators)
      .set({
        status: "approved_not_joined",
        profileCompleted: false,
        profileCompletedAt: null,
        joinedAt: null,
        fullName: "",
        country: null,
        languages: null,
        socialChannels: null,
        portfolioUrl: null,
        ugcCategories: null,
        contentFormats: null,
        profilePhoto: null,
        portfolioVideos: [],
        rateRangeSelf: null,
        genderIdentity: null,
        ageDemographic: null,
        ethnicity: null,
      })
      .where(eq(creators.id, creatorId));

    revalidatePath("/creator");
  } catch (err) {
    throw toActionError(err);
  }
}
