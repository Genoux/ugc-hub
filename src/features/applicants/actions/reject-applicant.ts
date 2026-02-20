"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { creators } from "@/db/schema";
import { requireAdmin } from "@/shared/lib/auth";
import { db } from "@/shared/lib/db";
import { rejectApplicantSchema } from "../schemas";

export async function rejectApplicant(creatorId: string) {
  await requireAdmin();

  const input = rejectApplicantSchema.parse({ creatorId });

  const [creator] = await db.select().from(creators).where(eq(creators.id, input.creatorId));

  if (!creator) throw new Error("Creator not found");

  await db
    .update(creators)
    .set({
      status: "rejected",
    })
    .where(eq(creators.id, input.creatorId));

  revalidatePath("/applicants");
  return { success: true };
}
