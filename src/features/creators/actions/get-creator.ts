"use server";

import { eq } from "drizzle-orm";
import { creators } from "@/db/schema";
import { db } from "@/shared/lib/db";

export async function getCreator(id: string) {
  try {
    const creator = await db.select().from(creators).where(eq(creators.id, id)).limit(1);

    if (!creator.length) {
      return { success: false, error: "Creator not found" };
    }

    return { success: true, creator: creator[0] };
  } catch (error) {
    console.error("Error fetching creator:", error);
    return { success: false, error: "Failed to fetch creator" };
  }
}
