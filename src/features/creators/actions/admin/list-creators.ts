"use server";

import { and, count, desc, eq, inArray } from "drizzle-orm";
import { creatorCollaborations, creators } from "@/db/schema";
import { creatorSchema } from "@/features/creators/schemas";
import { db } from "@/shared/lib/db";

export async function listCreators() {
  try {
    const rows = await db
      .select({
        creator: creators,
        collabCount: count(creatorCollaborations.id),
      })
      .from(creators)
      .leftJoin(
        creatorCollaborations,
        and(
          eq(creatorCollaborations.creatorId, creators.id),
          eq(creatorCollaborations.collaborationStatus, "closed"),
        ),
      )
      .where(inArray(creators.status, ["joined", "blacklisted"]))
      .groupBy(creators.id)
      .orderBy(desc(creators.joinedAt));

    const parsed = rows.map(({ creator, collabCount }) =>
      creatorSchema.parse({ ...creator, collabCount }),
    );

    return { success: true, creators: parsed };
  } catch (error) {
    console.error("Error listing creators:", error);
    return { success: false, error: "Failed to fetch creators" };
  }
}
