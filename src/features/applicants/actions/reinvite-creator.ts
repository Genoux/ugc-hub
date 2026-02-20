"use server";

import { eq } from "drizzle-orm";
import { creators } from "@/db/schema";
import { requireAdmin } from "@/shared/lib/auth";
import { sendInvitation } from "@/shared/lib/clerk";
import { db } from "@/shared/lib/db";
import { ROUTES } from "@/shared/lib/routes";

export async function reinviteCreator(creatorId: string) {
  await requireAdmin();

  const [creator] = await db.select().from(creators).where(eq(creators.id, creatorId));

  if (!creator) throw new Error("Creator not found");

  if (creator.status !== "approved_not_joined") {
    throw new Error("Creator is not in pending join status");
  }

  const result = await sendInvitation(
    creator.email,
    `${process.env.NEXT_PUBLIC_APP_URL}${ROUTES.signUp}`,
  );

  // already_has_account = they can sign in directly, no invite needed
  if (!result.ok && result.reason !== "already_has_account") {
    throw new Error("Failed to resend invitation");
  }

  return { success: true };
}
