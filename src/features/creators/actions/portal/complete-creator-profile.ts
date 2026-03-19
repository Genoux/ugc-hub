"use server";

import { randomUUID } from "node:crypto";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { creators } from "@/db/schema";
import type { PortfolioVideoEntry } from "@/entities/creator/types";
import { requireCreator } from "@/features/creators/lib/require-creator";
import { resizeProfilePhoto } from "@/features/creators/lib/resize-profile-photo";
import { R2_BUCKET_NAME, r2Client } from "@/features/uploads/lib/r2-client";
import { getR2SignedUrl } from "@/features/uploads/lib/r2-serve";
import { notifySlack } from "@/integrations/slack/notify-slack";
import { toActionError } from "@/shared/lib/action-error";
import { AGE_DEMOGRAPHICS, ETHNICITIES, GENDER_IDENTITIES } from "@/shared/lib/constants";
import { db } from "@/shared/lib/db";

const videoEntrySchema = z.object({
  key: z.string().min(1),
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().min(0),
});

const schema = z.object({
  fullName: z.string().min(1),
  country: z.string().min(1),
  languages: z.array(z.string()).min(1),
  socialChannels: z
    .object({
      instagram_url: z.url().optional(),
      tiktok_url: z.url().optional(),
      youtube_url: z.url().optional(),
    })
    .optional(),
  portfolioUrl: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === "") return undefined;
      const trimmed = val.trim();
      return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    })
    .pipe(z.url().optional()),
  ugcCategories: z.array(z.string()).min(1),
  contentFormats: z.array(z.string()).min(1),
  profilePhoto: z.string().min(1),
  rateRangeSelf: z.object({ min: z.number(), max: z.number() }).optional(),
  genderIdentity: z.enum(GENDER_IDENTITIES),
  ageDemographic: z.enum(AGE_DEMOGRAPHICS),
  ethnicities: z.array(z.enum(ETHNICITIES)).min(1),
  keepVideoIds: z.array(z.string().uuid()),
  newVideos: z.array(videoEntrySchema),
});

export async function completeCreatorProfile(input: z.infer<typeof schema>) {
  try {
    const creator = await requireCreator();
    const validated = schema.parse(input);

    const wasAlreadyCompleted = creator.profileCompleted;

    const currentVideos = (creator.portfolioVideos ?? []) as PortfolioVideoEntry[];
    const keepSet = new Set(validated.keepVideoIds);
    const keptVideos = currentVideos.filter((v) => keepSet.has(v.id));
    const droppedVideos = currentVideos.filter((v) => !keepSet.has(v.id));

    const newEntries: PortfolioVideoEntry[] = validated.newVideos.map((v) => ({
      id: randomUUID(),
      r2Key: v.key,
      filename: v.filename,
      mimeType: v.mimeType,
      sizeBytes: v.sizeBytes,
    }));

    await db
      .update(creators)
      .set({
        fullName: validated.fullName,
        country: validated.country,
        languages: validated.languages,
        socialChannels: validated.socialChannels,
        portfolioUrl: validated.portfolioUrl || null,
        ugcCategories: validated.ugcCategories,
        contentFormats: validated.contentFormats,
        profilePhoto: validated.profilePhoto,
        rateRangeSelf: validated.rateRangeSelf ?? null,
        genderIdentity: validated.genderIdentity,
        ageDemographic: validated.ageDemographic,
        ethnicity: validated.ethnicities,
        portfolioVideos: [...keptVideos, ...newEntries],
        profileCompleted: true,
        profileCompletedAt: new Date(),
        ...(!wasAlreadyCompleted && { status: "joined", joinedAt: new Date() }),
      })
      .where(eq(creators.id, creator.id));

    if (!wasAlreadyCompleted) {
      notifySlack(
        getR2SignedUrl(validated.profilePhoto).then((profileImageUrl) => ({
          type: "creator_profile_complete" as const,
          creatorId: creator.id,
          fullName: validated.fullName,
          email: creator.email ?? undefined,
          profileImageUrl: profileImageUrl ?? undefined,
        })),
      );
    }

    // Fire-and-forget — DB is already committed; orphans recoverable via check-r2-orphans
    for (const video of droppedVideos) {
      void r2Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: video.r2Key }));
    }

    void resizeProfilePhoto(validated.profilePhoto).catch((err) =>
      console.error("[profile-photo] resize failed:", err),
    );

    revalidatePath("/creator");
  } catch (err) {
    throw toActionError(err);
  }
}
