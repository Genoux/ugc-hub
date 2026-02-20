"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { creators } from "@/db/schema";
import { requireAdmin } from "@/shared/lib/auth";
import { sendInvitation } from "@/shared/lib/clerk";
import { db } from "@/shared/lib/db";
import { ROUTES } from "@/shared/lib/routes";
import { directInviteSchema } from "../schemas";

export async function directInvite(input: { email: string }) {
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
      fullName: validated.email.split("@")[0],
      status: "approved_not_joined",
      source: "direct_invite",
      approvedAt: new Date(),
      invitedAt: new Date(),
    })
    .returning();

  if (!newCreator) throw new Error("Insert failed");

  const rollback = () => db.delete(creators).where(eq(creators.id, newCreator.id));

  let result: Awaited<ReturnType<typeof sendInvitation>>;
  try {
    result = await sendInvitation(
      validated.email,
      `${process.env.NEXT_PUBLIC_APP_URL}${ROUTES.signUp}`,
      { role: "creator", creatorId: newCreator.id },
    );
  } catch (err) {
    await rollback();
    throw err;
  }

  if (!result.ok) {
    await rollback();
    return { success: false, error: "already_invited_or_exists" as const };
  }

  revalidatePath("/applicants");
  return { success: true };
}
