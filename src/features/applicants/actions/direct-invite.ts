"use server";

import { eq } from "drizzle-orm";
import { creators } from "@/db/schema";
import { toActionError } from "@/shared/lib/action-error";
import { getAppUrl } from "@/shared/lib/app-url";
import { requireAdmin } from "@/shared/lib/auth";
import { sendInvitation } from "@/shared/lib/clerk";
import { db } from "@/shared/lib/db";
import { ROUTES } from "@/shared/lib/routes";
import { directInviteSchema } from "../schemas";

export async function directInvite(input: { email: string }) {
  try {
    await requireAdmin();

    const validated = directInviteSchema.parse(input);

    const existing = await db.query.creators.findFirst({
      where: eq(creators.email, validated.email),
      columns: { id: true },
    });

    if (existing) {
      return { success: false, error: "already_exists" as const };
    }

    const [newCreator] = await db
      .insert(creators)
      .values({
        email: validated.email,
        fullName: "",
        country: "Unknown",
        status: "approved_not_joined",
        source: "direct_invite",
        approvedAt: new Date(),
        invitedAt: new Date(),
      })
      .returning();

    if (!newCreator) throw new Error("Insert failed");

    try {
      await sendInvitation(validated.email, `${await getAppUrl()}${ROUTES.signUp}`);
    } catch (err) {
      await db.delete(creators).where(eq(creators.id, newCreator.id));
      throw err;
    }

    return { success: true };
  } catch (err) {
    throw toActionError(err);
  }
}
