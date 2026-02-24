"use server";

import { and, count, desc, eq, inArray } from "drizzle-orm";
import { collaborations, creators } from "@/db/schema";
import { type Creator, creatorSchema } from "@/features/creators/schemas";
import { getR2SignedUrl } from "@/features/uploads/lib/r2-serve";
import { requireAdmin } from "@/shared/lib/auth";
import { db } from "@/shared/lib/db";

export type CreatorListItem = Creator & { profilePhotoUrl: string | null };

type GetCreatorsResult =
  | { success: true; creators: CreatorListItem[] }
  | { success: false; error: string };

export async function getCreators(): Promise<GetCreatorsResult> {
  try {
    await requireAdmin();

    const rows = await db
      .select({
        creator: creators,
        collabCount: count(collaborations.id),
      })
      .from(creators)
      .leftJoin(
        collaborations,
        and(eq(collaborations.creatorId, creators.id), eq(collaborations.status, "closed")),
      )
      .where(inArray(creators.status, ["joined", "blacklisted"]))
      .groupBy(creators.id)
      .orderBy(desc(creators.joinedAt));

    const parsed = rows.map(({ creator, collabCount }) =>
      creatorSchema.parse({ ...creator, collabCount: collabCount ?? 0 }),
    );

    const withPhotos = await Promise.all(
      parsed.map(async (creator) => ({
        ...creator,
        profilePhotoUrl: await getR2SignedUrl(creator.profilePhoto),
      })),
    );

    return { success: true, creators: withPhotos };
  } catch (error) {
    console.error("Error listing creators:", error);
    return { success: false, error: "Failed to fetch creators" };
  }
}
