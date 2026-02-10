"use server";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { campaigns } from "@/db/schema";
import { db } from "@/shared/lib/db";

export async function deleteCampaign(campaignId: string) {
  const { isAuthenticated, userId } = await auth();
  if (!isAuthenticated || !userId) throw new Error("Unauthorized");

  const campaign = await db.query.campaigns.findFirst({
    where: eq(campaigns.id, campaignId),
    columns: { id: true, userId: true },
  });

  if (!campaign) return null;
  if (campaign.userId !== userId) throw new Error("Forbidden");

  await db.delete(campaigns).where(eq(campaigns.id, campaignId));
  revalidatePath("/campaigns");
  return campaign;
}
