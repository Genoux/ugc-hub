"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { campaigns } from "@/db/schema";
import { db } from "@/shared/lib/db";
import { campaignSchema } from "../schemas";

export async function createCampaign(input: z.infer<typeof campaignSchema>) {
  const { isAuthenticated, userId } = await auth();
  if (!isAuthenticated) throw new Error("User not found");

  const data = campaignSchema.parse(input);

  const [campaign] = await db
    .insert(campaigns)
    .values({
      ...data,
      userId,
    })
    .returning();

  revalidatePath("/campaigns");
  return campaign;
}
