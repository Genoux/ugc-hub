"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { links, submissions } from "@/db/schema";
import { db } from "@/shared/lib/db";

export async function submitWizard(data: {
  token: string;
  creatorName: string;
  creatorEmail: string;
  creatorNotes?: string;
}) {
  const link = await db.query.links.findFirst({
    where: eq(links.token, data.token),
  });

  if (!link) {
    throw new Error("Link not found");
  }

  if (link.status !== "active") {
    throw new Error("Link is not active");
  }

  if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
    throw new Error("Link has expired");
  }

  const [submission] = await db
    .update(submissions)
    .set({
      creatorName: data.creatorName,
      creatorEmail: data.creatorEmail,
      creatorNotes: data.creatorNotes || null,
      status: "pending",
    })
    .where(eq(submissions.linkId, link.id))
    .returning();

  if (!submission) {
    throw new Error("Submission not found for this link");
  }

  await db.update(links).set({ status: "used" }).where(eq(links.id, link.id));

  revalidatePath(`/campaigns/${link.campaignId}`);
  return submission;
}
