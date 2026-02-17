"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { creators } from "@/db/schema";
import { db } from "@/shared/lib/db";
import { directInviteSchema } from "../schemas";

export async function directInvite(input: { email: string }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validated = directInviteSchema.parse(input);

  const existing = await db.query.creators.findFirst({
    where: eq(creators.email, validated.email),
    columns: { id: true, status: true },
  });

  let creatorId: string;

  if (existing) {
    if (existing.status === "joined") {
      return { success: false, error: "already_registered" as const };
    }
    creatorId = existing.id;
    await db
      .update(creators)
      .set({ status: "approved_not_joined", source: "direct_invite", profileReviewStatus: "approved", approvedAt: new Date() })
      .where(eq(creators.id, existing.id));
  } else {
    const [newCreator] = await db
      .insert(creators)
      .values({
        email: validated.email,
        fullName: validated.email.split("@")[0],
        status: "approved_not_joined",
        source: "direct_invite",
        profileReviewStatus: "approved",
        approvedAt: new Date(),
      })
      .returning();

    if (!newCreator) throw new Error("Insert failed");
    creatorId = newCreator.id;
  }

  // Send Clerk invitation — if the user already has a Clerk account they'll
  // just sign in and the layout will match them by email automatically.
  const client = await clerkClient();
  try {
    await client.invitations.createInvitation({
      emailAddress: validated.email,
      publicMetadata: { role: "creator", creatorId },
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/creator`,
      ignoreExisting: true,
    });
  } catch (err) {
    if (isClerkAPIResponseError(err) && err.status === 422) {
      if (!existing) {
        await db.delete(creators).where(eq(creators.id, creatorId));
      }
      return { success: false, error: "already_invited_or_exists" as const };
    }
    throw err;
  }

  revalidatePath("/applicants");
  return { success: true };
}
