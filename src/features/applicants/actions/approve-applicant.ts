"use server";

import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { creators } from "@/db/schema";
import { db } from "@/shared/lib/db";
import { approveApplicantSchema } from "../schemas";

export async function approveApplicant(creatorId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const input = approveApplicantSchema.parse({ creatorId });

  const [creator] = await db.select().from(creators).where(eq(creators.id, input.creatorId));

  if (!creator) throw new Error("Creator not found");

  if (creator.status !== "applicant" && creator.status !== "under_review") {
    throw new Error("Creator is not in applicant or under_review status");
  }

  await db
    .update(creators)
    .set({
      status: "approved_not_joined",
      source: "applicant",
      approvedAt: new Date(),
    })
    .where(eq(creators.id, input.creatorId));

  const client = await clerkClient();
  try {
    await client.invitations.createInvitation({
      emailAddress: creator.email,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/creator`,
      ignoreExisting: true,
    });
  } catch (err) {
    if (!isClerkAPIResponseError(err)) throw err;
    // Ignore 422 — user already has a Clerk account and will be matched by email in the layout
  }

  revalidatePath("/applicants");
  return { success: true };
}
