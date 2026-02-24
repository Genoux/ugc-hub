"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { creators } from "@/db/schema";
import { AGE_DEMOGRAPHICS, ETHNICITIES, GENDER_IDENTITIES } from "@/features/creators/constants";
import { toActionError } from "@/shared/lib/action-error";
import { db } from "@/shared/lib/db";

const schema = z.object({
  creatorId: z.string().uuid(),
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
  profilePhoto: z.string().optional(),
  rateRangeSelf: z.object({ min: z.number(), max: z.number() }).optional(),
  genderIdentity: z.enum(GENDER_IDENTITIES).optional(),
  ageDemographic: z.enum(AGE_DEMOGRAPHICS).optional(),
  ethnicity: z.enum(ETHNICITIES).optional(),
});

export async function completeCreatorProfile(input: z.infer<typeof schema>) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const validated = schema.parse(input);

    const record = await db.query.creators.findFirst({
      where: eq(creators.id, validated.creatorId),
      columns: { clerkUserId: true, email: true },
    });

    if (!record) throw new Error("Creator profile not found");

    const clerkUser = await (await clerkClient()).users.getUser(userId);
    const userEmail = clerkUser.primaryEmailAddress?.emailAddress?.toLowerCase().trim();
    const isOwner =
      record?.clerkUserId === userId ||
      (userEmail !== undefined && record?.email?.toLowerCase().trim() === userEmail);
    if (!isOwner) throw new Error("Forbidden — you don't own this profile");

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
        profilePhoto: validated.profilePhoto ?? null,
        rateRangeSelf: validated.rateRangeSelf ?? null,
        genderIdentity: validated.genderIdentity ?? null,
        ageDemographic: validated.ageDemographic ?? null,
        ethnicity: validated.ethnicity ?? null,
        profileCompleted: true,
        profileCompletedAt: new Date(),
        status: "joined",
        joinedAt: new Date(),
      })
      .where(eq(creators.id, validated.creatorId));

    revalidatePath("/creator");
  } catch (err) {
    throw toActionError(err);
  }
}
