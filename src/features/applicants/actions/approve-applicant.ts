"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { creators } from "@/db/schema";
import { requireAdmin } from "@/shared/lib/auth";
import { sendInvitation } from "@/shared/lib/clerk";
import { db } from "@/shared/lib/db";
import { ROUTES } from "@/shared/lib/routes";
import { approveApplicantSchema } from "../schemas";

export async function approveApplicant(creatorId: string) {
  await requireAdmin();

  const input = approveApplicantSchema.parse({ creatorId });

  const [creator] = await db.select().from(creators).where(eq(creators.id, input.creatorId));

  if (!creator) throw new Error("Creator not found");

  if (creator.status !== "applicant") {
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

  let result: Awaited<ReturnType<typeof sendInvitation>>;
  try {
    result = await sendInvitation(
      creator.email,
      `${process.env.NEXT_PUBLIC_APP_URL}${ROUTES.signUp}`,
    );
  } catch (err) {
    await revert();
    throw err;
  }

  // already_has_account = they can sign in directly, layout matches by email
  if (!result.ok && result.reason !== "already_has_account") {
    await revert();
    throw new Error("Failed to send invitation");
  }

  revalidatePath("/applicants");
  return { success: true };
}
