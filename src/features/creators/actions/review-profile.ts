"use server";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { creators } from "@/db/schema";
import { db } from "@/shared/lib/db";

export async function approveProfileReview(creatorId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db
    .update(creators)
    .set({ profileReviewStatus: "approved" })
    .where(eq(creators.id, creatorId));

  revalidatePath("/applicants");
}

export async function declineProfileReview(creatorId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db
    .update(creators)
    .set({ profileReviewStatus: "declined", status: "rejected" })
    .where(eq(creators.id, creatorId));

  revalidatePath("/applicants");
}
