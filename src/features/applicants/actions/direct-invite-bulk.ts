"use server";

import { inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { creators } from "@/db/schema";
import { toActionError } from "@/shared/lib/action-error";
import { getAppUrl } from "@/shared/lib/app-url";
import { requireAdmin } from "@/shared/lib/auth";
import { sendInvitationBulk } from "@/shared/lib/clerk";
import { db } from "@/shared/lib/db";
import { ROUTES } from "@/shared/lib/routes";
import { directInviteBulkSchema } from "../schemas";

export type DirectInviteBulkResult =
  | { success: true; sent: number; skipped: number }
  | { success: false; error: string };

export async function directInviteBulk(input: {
  emails: string[];
}): Promise<DirectInviteBulkResult> {
  try {
    await requireAdmin();

    const { emails } = directInviteBulkSchema.parse(input);

    const normalised = [...new Set(emails.map((e) => e.toLowerCase().trim()))];

    const existing = await db.query.creators.findMany({
      where: inArray(creators.email, normalised),
      columns: { email: true, status: true },
    });

    const existingEmails = new Set(existing.map((c) => c.email));

    const skipped = normalised.filter((e) => existingEmails.has(e));
    const toInvite = normalised.filter((e) => !existingEmails.has(e));

    if (toInvite.length === 0) {
      return { success: true, sent: 0, skipped: skipped.length };
    }

    const inserted = await db
      .insert(creators)
      .values(
        toInvite.map((email) => ({
          email,
          fullName: "",
          status: "approved_not_joined" as const,
          source: "direct_invite" as const,
          approvedAt: new Date(),
          invitedAt: new Date(),
        })),
      )
      .returning({ id: creators.id });

    const insertedIds = inserted.map((r) => r.id);

    let result: Awaited<ReturnType<typeof sendInvitationBulk>>;
    try {
      result = await sendInvitationBulk(toInvite, `${await getAppUrl()}${ROUTES.signUp}`);
    } catch (err) {
      // No invite was sent — roll back to avoid ghost records
      await db.delete(creators).where(inArray(creators.id, insertedIds));
      throw err;
    }

    revalidatePath("/applicants");
    return {
      success: true,
      sent: result.sent,
      skipped: skipped.length + result.skipped,
    };
  } catch (err) {
    throw toActionError(err);
  }
}
