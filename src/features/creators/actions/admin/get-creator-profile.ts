"use server";

import { eq } from "drizzle-orm";
import { creators } from "@/db/schema";
import { type Creator, creatorSchema } from "@/features/creators/schemas";
import type {
  CollaborationHighlight,
  PortfolioVideo,
  PortfolioVideoEntry,
} from "@/entities/creator/types";
import { toMediaUrl } from "@/features/uploads/lib/r2-media-url";
import { requireAdmin } from "@/shared/lib/auth";
import type { ClerkUserProfile } from "@/shared/lib/clerk";
import type { DbCreatorStatus } from "@/shared/lib/constants";
import { getClerkUserProfile } from "@/shared/lib/clerk";
import { db } from "@/shared/lib/db";

type SubmissionAsset = { id: string; filename: string; mimeType: string; url: string };
type CollabSubmission = {
  id: string;
  label: string;
  submissionNumber: number;
  deliveredAt: Date;
  assets: SubmissionAsset[];
};

type CreatorProfileBase = Omit<
  Creator,
  "status" | "blacklistReason" | "blacklistedAt" | "blacklistedBy"
> & {
  profilePhotoUrl: string | null;
  portfolioVideos: PortfolioVideo[];
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

export type CreatorProfile =
  | (CreatorProfileBase & {
      status: "blacklisted";
      blacklistReason: string;
      blacklistedAt: Date;
      blacklistedBy: string;
      blacklistedByProfile: ClerkUserProfile;
    })
  | (CreatorProfileBase & {
      status: Exclude<DbCreatorStatus, "blacklisted">;
      blacklistReason: string | null;
      blacklistedAt: Date | null;
      blacklistedBy: string | null;
      blacklistedByProfile: ClerkUserProfile | null;
    });

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

  const profilePhotoUrl = toMediaUrl(row.profilePhoto);

  const portfolioVideos = ((row.portfolioVideos ?? []) as PortfolioVideoEntry[]).map((v) => ({
    id: v.id,
    filename: v.filename,
    mimeType: v.mimeType,
    sizeBytes: v.sizeBytes,
    url: toMediaUrl(v.r2Key) ?? "",
  }));

  const closedCollaborations = await Promise.all(
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
      highlights: ((collab.highlights ?? []) as CollaborationHighlight[]).map((h) => ({
        id: h.id,
        filename: h.filename,
        mimeType: h.mimeType,
        url: toMediaUrl(h.r2Key) ?? "",
      })),
      submissions: collab.submissions.map((s) => ({
        id: s.id,
        label: s.label,
        submissionNumber: s.submissionNumber,
        deliveredAt: s.deliveredAt,
        assets: s.assets.map((a) => ({
          id: a.id,
          filename: a.filename,
          mimeType: a.mimeType,
          url: toMediaUrl(a.r2Key) ?? "",
        })),
      })),
    })),
  );

  const blacklistedByProfile = creator.blacklistedBy
    ? await getClerkUserProfile(creator.blacklistedBy)
    : null;

  // Cast is safe: the DB enforces that blacklistReason/blacklistedBy are non-null when status === "blacklisted"
  return {
    ...creator,
    profilePhotoUrl,
    blacklistedByProfile,
    portfolioVideos,
    closedCollaborations,
  } as CreatorProfile;
}
