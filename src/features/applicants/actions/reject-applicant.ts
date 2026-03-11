"use server";

import { eq } from "drizzle-orm";
import { creators } from "@/db/schema";
import { toActionError } from "@/shared/lib/action-error";
import { requireAdmin } from "@/shared/lib/auth";
import { db } from "@/shared/lib/db";
import { rejectApplicantSchema } from "../schemas";

export async function rejectApplicant(creatorId: string) {
  try {
    await requireAdmin();

    const input = rejectApplicantSchema.parse({ creatorId });

    const [creator] = await db.select().from(creators).where(eq(creators.id, input.creatorId));

    if (!creator) throw new Error("Creator not found");

    await db
      .update(creators)
      .set({
        status: "rejected",
      })
      .where(eq(creators.id, input.creatorId));

    return { success: true };
  } catch (err) {
    throw toActionError(err);
  }
}
