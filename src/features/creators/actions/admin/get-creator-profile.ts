"use server";

import { eq } from "drizzle-orm";
import { creators } from "@/db/schema";
import type { CollaborationHighlight, PortfolioVideoEntry } from "@/features/creators/constants";
import { creatorSchema } from "@/features/creators/schemas";
import { getR2SignedUrl } from "@/features/uploads/lib/r2-serve";
import { requireAdmin } from "@/shared/lib/auth";
import { db } from "@/shared/lib/db";

export type CreatorProfile = ReturnType<typeof creatorSchema.parse> & {
  profilePhotoUrl: string | null;
  portfolioVideos: {
    id: string;
    filename: string;
    mimeType: string;
    sizeBytes: number;
    url: string;
  }[];
  closedCollaborations: {
    id: string;
    projectName: string;
    closedAt: Date;
    piecesOfContent: number | null;
    totalPaidCents: number | null;
    ratingVisualQuality: string | null;
    ratingActingDelivery: string | null;
    ratingReliabilitySpeed: string | null;
    reviewNotes: string | null;
    highlights: { id: string; filename: string; mimeType: string; url: string }[];
  }[];
};

export async function getCreatorProfile(creatorId: string): Promise<CreatorProfile> {
  await requireAdmin();

  const row = await db.query.creators.findFirst({
    where: eq(creators.id, creatorId),
    with: {
      collaborations: {
        where: (c, { eq: eqFn }) => eqFn(c.status, "closed"),
        columns: {
          id: true,
          closedAt: true,
          piecesOfContent: true,
          totalPaid: true,
          ratingVisualQuality: true,
          ratingActingDelivery: true,
          ratingReliabilitySpeed: true,
          reviewNotes: true,
          highlights: true,
        },
        with: { project: { columns: { name: true } } },
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
        projectName: collab.project.name,
        closedAt: collab.closedAt as Date,
        piecesOfContent: collab.piecesOfContent,
        totalPaidCents: collab.totalPaid,
        ratingVisualQuality: collab.ratingVisualQuality,
        ratingActingDelivery: collab.ratingActingDelivery,
        ratingReliabilitySpeed: collab.ratingReliabilitySpeed,
        reviewNotes: collab.reviewNotes,
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
