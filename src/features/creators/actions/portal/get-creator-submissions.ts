"use server";

import { eq } from "drizzle-orm";
import { creatorCollaborations } from "@/db/schema";
import { db } from "@/shared/lib/db";

export async function getCreatorSubmissions(creatorId: string) {
  const collabs = await db.query.creatorCollaborations.findMany({
    where: eq(creatorCollaborations.creatorId, creatorId),
    with: {
      submission: {
        columns: { id: true, name: true },
      },
      creatorSubmissions: {
        with: {
          submissionAssets: {
            columns: { id: true, filename: true, mimeType: true, sizeBytes: true },
          },
        },
        orderBy: (cs, { asc }) => [asc(cs.batchNumber)],
      },
    },
  });

  return collabs.map((collab) => ({
    submissionId: collab.submission.id,
    submissionName: collab.submission.name,
    batches: collab.creatorSubmissions.map((batch) => ({
      id: batch.id,
      label: batch.label,
      batchNumber: batch.batchNumber,
      deliveredAt: batch.deliveredAt,
      assets: batch.submissionAssets,
    })),
  }));
}

export type CreatorSubmissions = Awaited<ReturnType<typeof getCreatorSubmissions>>;
