"use server";

import { desc, eq } from "drizzle-orm";
import { creators } from "@/db/schema";
import { db } from "@/shared/lib/db";

export async function listCreators() {
  try {
    const allCreators = await db
      .select()
      .from(creators)
      .where(eq(creators.profileCompleted, true))
      .orderBy(desc(creators.joinedAt));

    return { success: true, creators: allCreators };
  } catch (error) {
    console.error("Error listing creators:", error);
    return { success: false, error: "Failed to fetch creators" };
  }
}
