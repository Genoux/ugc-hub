"use server";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { creators } from "@/db/schema";
import { db } from "@/shared/lib/db";
import { rejectApplicantSchema } from "../schemas";

export async function rejectApplicant(creatorId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

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
