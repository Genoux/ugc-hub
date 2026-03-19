"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { creators } from "@/db/schema";
import { requireCreator } from "@/features/creators/lib/require-creator";
import { getR2SignedUrl } from "@/features/uploads/lib/r2-serve";
import { resizeProfilePhoto } from "@/features/uploads/lib/resize-profile-photo";
import { notifySlack } from "@/integrations/slack/notify-slack";
import { toActionError } from "@/shared/lib/action-error";
import { AGE_DEMOGRAPHICS, ETHNICITIES, GENDER_IDENTITIES } from "@/shared/lib/constants";
import { db } from "@/shared/lib/db";

const schema = z.object({
  // Steps 1-2
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
  // Steps 3-9
  ugcCategories: z.array(z.string()).min(1),
  contentFormats: z.array(z.string()).min(1),
  profilePhoto: z.string().min(1),
  rateRangeSelf: z.object({ min: z.number(), max: z.number() }).optional(),
  genderIdentity: z.enum(GENDER_IDENTITIES),
  ageDemographic: z.enum(AGE_DEMOGRAPHICS),
  ethnicities: z.array(z.enum(ETHNICITIES)).min(1),
});

export async function completeCreatorProfile(input: z.infer<typeof schema>) {
  try {
    const creator = await requireCreator();
    const validated = schema.parse(input);

    const wasAlreadyCompleted = creator.profileCompleted;

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

    void resizeProfilePhoto(validated.profilePhoto)
      .catch((err) => console.error("[profile-photo] resize failed:", err));

    revalidatePath("/creator");
  } catch (err) {
    throw toActionError(err);
  }
}
