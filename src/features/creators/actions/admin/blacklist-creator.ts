"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { creators } from "@/db/schema";
import { toActionError } from "@/shared/lib/action-error";
import { requireAdmin } from "@/shared/lib/auth";
import { db } from "@/shared/lib/db";

const blacklistCreatorSchema = z.object({
  creatorId: z.uuid(),
  reason: z.string().min(1, "Reason is required"),
});

export async function blacklistCreator(creatorId: string, reason: string) {
  try {
    const { userId } = await requireAdmin();

    const input = blacklistCreatorSchema.parse({ creatorId, reason });

    const [creator] = await db.select().from(creators).where(eq(creators.id, input.creatorId));

    if (!creator) throw new Error("Creator not found");

    await db
      .update(creators)
      .set({
        status: "blacklisted",
        overallRating: "blacklisted",
        blacklistReason: input.reason,
        blacklistedAt: new Date(),
        blacklistedBy: userId,
      })
      .where(eq(creators.id, input.creatorId));

    return { success: true };
  } catch (err) {
    throw toActionError(err);
  }
}
