"use server";

import { and, eq, isNotNull } from "drizzle-orm";
import { collaborations } from "@/db/schema";
import { requireCreator } from "@/features/creators/lib/require-creator";
import { toMediaUrl } from "@/features/uploads/lib/r2-media-url";
import { db } from "@/shared/lib/db";

export async function getCreatorSubmissions() {
  const creator = await requireCreator();

  const collabs = await db.query.collaborations.findMany({
    where: and(eq(collaborations.creatorId, creator.id), isNotNull(collaborations.projectId)),
    with: {
      project: {
        columns: { id: true, name: true },
      },
      submissions: {
        with: {
          assets: {
            columns: { id: true, filename: true, mimeType: true, sizeBytes: true, r2Key: true },
          },
        },
        orderBy: (cs, { asc }) => [asc(cs.submissionNumber)],
      },
    },
  });

  return collabs.flatMap((collab) => {
    const project = collab.project;
    if (!project) return [];
    return [
      {
        projectId: project.id,
        projectName: project.name,
        status: collab.status,
        createdAt: collab.createdAt,
        submissions: collab.submissions.map((submission) => ({
          id: submission.id,
          label: submission.label,
          submissionNumber: submission.submissionNumber,
          deliveredAt: submission.deliveredAt,
          assets: submission.assets.map((asset) => ({
            id: asset.id,
            filename: asset.filename,
            mimeType: asset.mimeType,
            sizeBytes: asset.sizeBytes,
            url: toMediaUrl(asset.r2Key) ?? "",
          })),
        })),
      },
    ];
  });
}

export type CreatorSubmissions = Awaited<ReturnType<typeof getCreatorSubmissions>>;
