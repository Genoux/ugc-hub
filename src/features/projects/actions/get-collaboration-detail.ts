"use server";

import { and, eq, ne } from "drizzle-orm";
import { collaborations } from "@/db/schema";
import type { CollaborationDetail } from "@/entities/collaboration/types";
import type { CollaborationHighlight } from "@/entities/creator/types";
import { toMediaUrl } from "@/features/uploads/lib/r2-media-url";
import { requireAdmin } from "@/shared/lib/auth";
import { db } from "@/shared/lib/db";

export async function getCollaborationDetail(
  collaborationId: string,
  projectId: string,
): Promise<CollaborationDetail | null> {
  await requireAdmin();

  const raw = await db.query.collaborations.findFirst({
    where: eq(collaborations.id, collaborationId),
    with: {
      project: { columns: { id: true, name: true } },
      creator: {
        columns: { id: true, fullName: true, email: true, profilePhoto: true, profilePhotoBlurDataUrl: true, profileCompletedAt: true },
      },
      submissions: {
        columns: { id: true, label: true, submissionNumber: true, deliveredAt: true },
        orderBy: (s, { asc }) => [asc(s.submissionNumber)],
        with: {
          assets: {
            columns: { id: true, filename: true, mimeType: true, sizeBytes: true, r2Key: true },
          },
        },
      },
    },
  });

  if (!raw || raw.project.id !== projectId) return null;

  const closedCollabRatings = await db
    .select({
      ratingVisualQuality: collaborations.ratingVisualQuality,
      ratingActingDelivery: collaborations.ratingActingDelivery,
      ratingReliabilitySpeed: collaborations.ratingReliabilitySpeed,
    })
    .from(collaborations)
    .where(
      and(
        eq(collaborations.creatorId, raw.creator.id),
        eq(collaborations.status, "closed"),
        ne(collaborations.id, collaborationId),
      ),
    );

  return {
    id: raw.id,
    status: raw.status,
    project: raw.project,
    creator: {
      id: raw.creator.id,
      fullName: raw.creator.fullName,
      email: raw.creator.email,
      profilePhotoUrl: toMediaUrl(raw.creator.profilePhoto, raw.creator.profileCompletedAt),
      profilePhotoBlurDataUrl: raw.creator.profilePhotoBlurDataUrl ?? null,
      closedCollabRatings,
    },
    submissions: raw.submissions.map((submission) => ({
      id: submission.id,
      label: submission.label,
      submissionNumber: submission.submissionNumber,
      deliveredAt: submission.deliveredAt,
      assets: submission.assets.map(({ r2Key, ...asset }) => ({
        ...asset,
        url: toMediaUrl(r2Key) ?? "",
      })),
    })),
    highlights: ((raw.highlights ?? []) as CollaborationHighlight[]).map((h) => ({
      id: h.id,
      filename: h.filename,
      mimeType: h.mimeType,
      url: toMediaUrl(h.r2Key) ?? "",
    })),
  };
}
