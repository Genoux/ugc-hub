"use server";

import { eq } from "drizzle-orm";
import { creators } from "@/db/schema";
import { toActionError } from "@/shared/lib/action-error";
import { getAppUrl } from "@/shared/lib/app-url";
import { requireAdmin } from "@/shared/lib/auth";
import { sendInvitation } from "@/shared/lib/clerk";
import { db } from "@/shared/lib/db";
import { ROUTES } from "@/shared/lib/routes";
import { approveApplicantSchema } from "../schemas";

export async function approveApplicant(creatorId: string) {
  try {
    await requireAdmin();

    const input = approveApplicantSchema.parse({ creatorId });

    const [creator] = await db.select().from(creators).where(eq(creators.id, input.creatorId));

    if (!creator) throw new Error("Creator not found");

    if (creator.status !== "applicant" && creator.status !== "rejected") {
      throw new Error("Creator is not in applicant status");
    }

    await db
      .update(creators)
      .set({
        status: "approved_not_joined",
        source: "applicant",
        approvedAt: new Date(),
        invitedAt: new Date(),
      })
      .where(eq(creators.id, input.creatorId));

    const revert = () =>
      db
        .update(creators)
        .set({ status: "applicant", approvedAt: null, invitedAt: null })
        .where(eq(creators.id, input.creatorId));

    try {
      await sendInvitation(creator.email, `${await getAppUrl()}${ROUTES.signUp}`);
    } catch (err) {
      await revert();
      throw err;
    }

    return { success: true };
  } catch (err) {
    throw toActionError(err);
  }
}
