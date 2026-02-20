"use server";

import { eq } from "drizzle-orm";
import { creatorFolders } from "@/db/schema";
import { db } from "@/shared/lib/db";

export async function getCreatorSubmissions(creatorId: string) {
  const folders = await db.query.creatorFolders.findMany({
    where: eq(creatorFolders.creatorId, creatorId),
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

  return folders.map((folder) => ({
    submissionId: folder.submission.id,
    submissionName: folder.submission.name,
    batches: folder.creatorSubmissions.map((batch) => ({
      id: batch.id,
      label: batch.label,
      batchNumber: batch.batchNumber,
      deliveredAt: batch.deliveredAt,
      assets: batch.submissionAssets,
    })),
  }));
}

export type CreatorSubmissions = Awaited<ReturnType<typeof getCreatorSubmissions>>;
