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
import type { ClerkUserProfile } from "@/shared/lib/clerk";
import { getClerkUserProfile } from "@/shared/lib/clerk";
import { requireAdmin } from "@/shared/lib/auth";
import { db } from "@/shared/lib/db";

type SubmissionAsset = { id: string; filename: string; mimeType: string; url: string };
type CollabSubmission = {
  id: string;
  label: string;
  submissionNumber: number;
  deliveredAt: Date;
  assets: SubmissionAsset[];
};

export type CreatorProfile = ReturnType<typeof creatorSchema.parse> & {
  profilePhotoUrl: string | null;
  portfolioVideos: PortfolioVideoWithUrl[];
  closedCollaborations: {
    id: string;
    projectName: string;
    closedAt: Date;
    closedBy: ClerkUserProfile | null;
    piecesOfContent: number | null;
    totalPaidCents: number | null;
    ratingVisualQuality: string | null;
    ratingActingDelivery: string | null;
    ratingReliabilitySpeed: string | null;
    reviewNotes: string | null;
    highlights: { id: string; filename: string; mimeType: string; url: string }[];
    submissions: CollabSubmission[];
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
          closedBy: true,
          piecesOfContent: true,
          totalPaid: true,
          ratingVisualQuality: true,
          ratingActingDelivery: true,
          ratingReliabilitySpeed: true,
          reviewNotes: true,
          highlights: true,
        },
        with: {
          project: { columns: { name: true } },
          submissions: {
            columns: { id: true, label: true, submissionNumber: true, deliveredAt: true },
            with: {
              assets: {
                columns: { id: true, filename: true, mimeType: true, r2Key: true },
                where: (a, { eq: eqFn }) => eqFn(a.uploadStatus, "completed"),
              },
            },
            orderBy: (s, { asc }) => [asc(s.submissionNumber)],
          },
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
        projectName: collab.project.name,
        closedAt: collab.closedAt as Date,
        closedBy: collab.closedBy ? await getClerkUserProfile(collab.closedBy) : null,
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
        submissions: await Promise.all(
          collab.submissions.map(async (s) => ({
            id: s.id,
            label: s.label,
            submissionNumber: s.submissionNumber,
            deliveredAt: s.deliveredAt,
            assets: await Promise.all(
              s.assets.map(async (a) => ({
                id: a.id,
                filename: a.filename,
                mimeType: a.mimeType,
                url: (await getR2SignedUrl(a.r2Key)) ?? "",
              })),
            ),
          })),
        ),
      })),
    ),
  ]);

  return { ...creator, profilePhotoUrl, portfolioVideos, closedCollaborations };
}
