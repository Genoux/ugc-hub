"use server";

import { eq } from "drizzle-orm";
import { creators } from "@/db/schema";
import type {
  CollaborationHighlight,
  PortfolioVideoEntry,
  PortfolioVideo,
} from "@/features/creators/constants";
import { requireCreator } from "@/features/creators/lib/require-creator";
import { creatorSchema } from "@/features/creators/schemas";
import { toMediaUrl } from "@/features/uploads/lib/r2-media-url";
import { db } from "@/shared/lib/db";

export type CreatorProfile = ReturnType<typeof creatorSchema.parse> & {
  profilePhotoUrl: string | null;
  portfolioVideos: PortfolioVideo[];
  closedCollaborations: {
    id: string;
    highlights: { id: string; filename: string; mimeType: string; url: string }[];
  }[];
};

export async function getCreatorProfile(): Promise<CreatorProfile> {
  const sessionCreator = await requireCreator();

  const row = await db.query.creators.findFirst({
    where: eq(creators.id, sessionCreator.id),
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

  const profilePhotoUrl = toMediaUrl(row.profilePhoto);

  const portfolioVideos = ((row.portfolioVideos ?? []) as PortfolioVideoEntry[]).map((v) => ({
    id: v.id,
    filename: v.filename,
    mimeType: v.mimeType,
    sizeBytes: v.sizeBytes,
    url: toMediaUrl(v.r2Key) ?? "",
  }));

  const closedCollaborations = row.collaborations.map((collab) => ({
    id: collab.id,
    highlights: ((collab.highlights ?? []) as CollaborationHighlight[]).map((h) => ({
      id: h.id,
      filename: h.filename,
      mimeType: h.mimeType,
      url: toMediaUrl(h.r2Key) ?? "",
    })),
  }));

  return { ...creator, profilePhotoUrl, portfolioVideos, closedCollaborations };
}
