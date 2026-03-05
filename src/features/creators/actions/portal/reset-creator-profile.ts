"use server";

import { DeleteObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { creators } from "@/db/schema";
import type { PortfolioVideoEntry } from "@/features/creators/types";
import { requireCreator } from "@/features/creators/lib/require-creator";
import { R2_BUCKET_NAME, r2Client } from "@/features/uploads/lib/r2-client";
import { toActionError } from "@/shared/lib/action-error";
import { db } from "@/shared/lib/db";

export async function resetCreatorProfile() {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("Dev only");
  }

  try {
    const creator = await requireCreator();

    const record = await db.query.creators.findFirst({
      where: eq(creators.id, creator.id),
      columns: { portfolioVideos: true, profilePhoto: true },
    });

    if (!record) throw new Error("Creator profile not found");

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
      .where(eq(creators.id, creator.id));

    revalidatePath("/creator");
  } catch (err) {
    throw toActionError(err);
  }
}
