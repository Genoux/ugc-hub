"use server";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { creators } from "@/db/schema";
import { db } from "@/shared/lib/db";

const schema = z.object({
  creatorId: z.string().uuid(),
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
  portfolioUrl: z.string().url().optional().or(z.literal("")),
});

export async function completeMinimalProfile(input: z.infer<typeof schema>) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validated = schema.parse(input);

  await db
    .update(creators)
    .set({
      fullName: validated.fullName,
      country: validated.country,
      languages: validated.languages,
      socialChannels: validated.socialChannels,
      portfolioUrl: validated.portfolioUrl || null,
      minimalProfileCompleted: true,
      profileReviewStatus: "pending",
      status: "under_review",
    })
    .where(eq(creators.id, validated.creatorId));

  revalidatePath("/creator");
}
