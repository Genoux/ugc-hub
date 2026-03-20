"use server";

import { eq } from "drizzle-orm";
import { collaborations } from "@/db/schema";
import type { CollaborationHighlight } from "@/entities/creator/types";
import { requireCreator } from "@/features/creators/lib/require-creator";
import { toWorkerUrl } from "@/features/uploads/lib/r2-media-url";
import { db } from "@/shared/lib/db";

export async function getCreatorSubmissions() {
  const creator = await requireCreator();

  const collabs = await db.query.collaborations.findMany({
    where: eq(collaborations.creatorId, creator.id),
    orderBy: (c, { desc }) => [desc(c.createdAt)],
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

  return collabs.map((collab) => {
    const projectName =
      collab.project?.name ?? collab.name ?? "Collaboration";

    const highlights = ((collab.highlights ?? []) as CollaborationHighlight[]).map((h) => ({
      id: h.id,
      filename: h.filename,
      mimeType: h.mimeType,
      sizeBytes: h.sizeBytes,
      url: toWorkerUrl(h.r2Key) ?? "",
    }));

    return {
      id: collab.id,
      projectId: collab.projectId,
      projectName,
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
          url: toWorkerUrl(asset.r2Key) ?? "",
        })),
      })),
      highlights,
    };
  });
}

export type CreatorSubmissions = Awaited<ReturnType<typeof getCreatorSubmissions>>;
