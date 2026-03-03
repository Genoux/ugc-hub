"use server";

import { eq } from "drizzle-orm";
import { creators } from "@/db/schema";
import type {
  CollaborationHighlight,
  PortfolioVideoEntry,
  PortfolioVideoWithUrl,
} from "@/features/creators/constants";
import { creatorSchema } from "@/features/creators/schemas";
import { getR2SignedUrl } from "@/features/uploads/lib/r2-serve";
import { db } from "@/shared/lib/db";

export type CreatorProfile = ReturnType<typeof creatorSchema.parse> & {
  profilePhotoUrl: string | null;
  portfolioVideos: PortfolioVideoWithUrl[];
  closedCollaborations: {
    id: string;
    highlights: { id: string; filename: string; mimeType: string; url: string }[];
  }[];
};

export async function getCreatorProfile(creatorId: string): Promise<CreatorProfile> {
  const row = await db.query.creators.findFirst({
    where: eq(creators.id, creatorId),
    with: {
      collaborations: {
        where: (c, { eq: eqFn }) => eqFn(c.status, "closed"),
        columns: {
          id: true,
          highlights: true,
        },
        orderBy: (c, { desc }) => [desc(c.closedAt)],
      },
    },
  });

  if (!row) throw new Error("Creator not found");

  const creator = creatorSchema.parse(row);

  const [profilePhotoUrl, portfolioVideos, closedCollaborations] = await Promise.all([
    getR2SignedUrl(row.profilePhoto),
    Promise.all(
      ((row.portfolioVideos ?? []) as PortfolioVideoEntry[]).map(async (v) => ({
        id: v.id,
        filename: v.filename,
        mimeType: v.mimeType,
        sizeBytes: v.sizeBytes,
        url: (await getR2SignedUrl(v.r2Key)) ?? "",
      })),
    ),
    Promise.all(
      row.collaborations.map(async (collab) => ({
        id: collab.id,
        highlights: await Promise.all(
          ((collab.highlights ?? []) as CollaborationHighlight[]).map(async (h) => ({
            id: h.id,
            filename: h.filename,
            mimeType: h.mimeType,
            url: (await getR2SignedUrl(h.r2Key)) ?? "",
          })),
        ),
      })),
    ),
  ]);

  return { ...creator, profilePhotoUrl, portfolioVideos, closedCollaborations };
}
