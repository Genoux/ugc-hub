"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { creators } from "@/db/schema";
import { requireCreator } from "@/features/creators/lib/require-creator";
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
      instagram_handle: z.string().optional(),
      tiktok_handle: z.string().optional(),
      youtube_handle: z.string().optional(),
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
  ethnicity: z.enum(ETHNICITIES),
});

export async function completeCreatorProfile(input: z.infer<typeof schema>) {
  try {
    const creator = await requireCreator();
    const validated = schema.parse(input);

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
        ethnicity: validated.ethnicity,
        profileCompleted: true,
        profileCompletedAt: new Date(),
        status: "joined",
        joinedAt: new Date(),
      })
      .where(eq(creators.id, creator.id));

    revalidatePath("/creator");
  } catch (err) {
    throw toActionError(err);
  }
}
