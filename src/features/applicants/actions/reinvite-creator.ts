"use server";

import { eq } from "drizzle-orm";
import { creators } from "@/db/schema";
import { toActionError } from "@/shared/lib/action-error";
import { getAppUrl } from "@/shared/lib/app-url";
import { requireAdmin } from "@/shared/lib/auth";
import { sendInvitation } from "@/shared/lib/clerk";
import { db } from "@/shared/lib/db";
import { ROUTES } from "@/shared/lib/routes";

export async function reinviteCreator(creatorId: string) {
  try {
    await requireAdmin();

    const [creator] = await db.select().from(creators).where(eq(creators.id, creatorId));

    if (!creator) throw new Error("Creator not found");

    if (creator.status !== "approved_not_joined") {
      throw new Error("Creator is not in pending join status");
    }

    // Already has a Clerk account — no invite needed, they can sign in directly
    if (creator.clerkUserId) return { success: true };

    await sendInvitation(creator.email, `${await getAppUrl()}${ROUTES.signUp}`);

    return { success: true };
  } catch (err) {
    throw toActionError(err);
  }
}
