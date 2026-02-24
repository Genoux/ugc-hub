"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { creators } from "@/db/schema";
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
      columns: { clerkUserId: true, email: true },
    });

    const clerkUser = await (await clerkClient()).users.getUser(userId);
    const userEmail = clerkUser.primaryEmailAddress?.emailAddress?.toLowerCase().trim();
    const isOwner =
      record?.clerkUserId === userId ||
      (userEmail !== undefined && record?.email?.toLowerCase().trim() === userEmail);
    if (!isOwner) throw new Error("Forbidden");

    await db
      .update(creators)
      .set({
        status: "approved_not_joined",
        profileCompleted: false,
        profileCompletedAt: null,
        joinedAt: null,
        country: null,
        languages: null,
        socialChannels: null,
        portfolioUrl: null,
        ugcCategories: null,
        contentFormats: null,
        profilePhoto: null,
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
