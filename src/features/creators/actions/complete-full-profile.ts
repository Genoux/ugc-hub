"use server";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { creators } from "@/db/schema";
import { db } from "@/shared/lib/db";

const schema = z.object({
  creatorId: z.string().uuid(),
  ugcCategories: z.array(z.string()).min(1),
  contentFormats: z.array(z.string()).min(1),
  profilePhoto: z.string().url().optional(),
  rateRangeSelf: z.object({ min: z.number(), max: z.number() }).optional(),
  genderIdentity: z.string().optional(),
  ageDemographic: z.string().optional(),
  ethnicity: z.string().optional(),
});

export async function completeFullProfile(input: z.infer<typeof schema>) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validated = schema.parse(input);

  await db
    .update(creators)
    .set({
      ugcCategories: validated.ugcCategories,
      contentFormats: validated.contentFormats,
      profilePhoto: validated.profilePhoto ?? null,
      rateRangeSelf: validated.rateRangeSelf ?? null,
      genderIdentity: validated.genderIdentity ?? null,
      ageDemographic: validated.ageDemographic ?? null,
      ethnicity: validated.ethnicity ?? null,
      profileCompleted: true,
      profileCompletedAt: new Date(),
    })
    .where(eq(creators.id, validated.creatorId));

  revalidatePath("/creator");
}
