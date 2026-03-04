"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { creators } from "@/db/schema";
import { toActionError } from "@/shared/lib/action-error";
import { requireAdmin } from "@/shared/lib/auth";
import { revokeInvitation as revokeClerkInvitation } from "@/shared/lib/clerk";
import { db } from "@/shared/lib/db";

export async function revokeInvitation(creatorId: string) {
  try {
    await requireAdmin();

    const [creator] = await db.select().from(creators).where(eq(creators.id, creatorId));

    if (!creator) throw new Error("Creator not found");

    if (creator.status !== "approved_not_joined") {
      throw new Error("Creator does not have a pending invitation");
    }

    await revokeClerkInvitation(creator.email);

    await db
      .update(creators)
      .set({ status: "applicant", approvedAt: null, invitedAt: null })
      .where(eq(creators.id, creatorId));

    revalidatePath("/applicants");
    return { success: true };
  } catch (err) {
    throw toActionError(err);
  }
}
