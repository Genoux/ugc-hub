"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { collaborations, creators } from "@/db/schema";
import { calculateCreatorRating } from "@/shared/lib/calculate-ratings";
import { toActionError } from "@/shared/lib/action-error";
import { requireAdmin } from "@/shared/lib/auth";
import { db } from "@/shared/lib/db";

const unblacklistCreatorSchema = z.object({
  creatorId: z.uuid(),
});

export async function unblacklistCreator(creatorId: string) {
  try {
    await requireAdmin();

    const input = unblacklistCreatorSchema.parse({ creatorId });

    const [creator] = await db.select().from(creators).where(eq(creators.id, input.creatorId));

    if (!creator) throw new Error("Creator not found");
    if (creator.status !== "blacklisted") throw new Error("Creator is not blacklisted");

    const closedCollabs = await db
      .select({
        ratingVisualQuality: collaborations.ratingVisualQuality,
        ratingActingDelivery: collaborations.ratingActingDelivery,
        ratingReliabilitySpeed: collaborations.ratingReliabilitySpeed,
      })
      .from(collaborations)
      .where(and(eq(collaborations.creatorId, input.creatorId), eq(collaborations.status, "closed")));

    const restoredRating = calculateCreatorRating(closedCollabs);

    await db
      .update(creators)
      .set({
        status: "joined",
        overallRating: restoredRating,
        blacklistReason: null,
        blacklistedAt: null,
        blacklistedBy: null,
      })
      .where(eq(creators.id, input.creatorId));

    revalidatePath("/database");
    return { success: true };
  } catch (err) {
    throw toActionError(err);
  }
}
