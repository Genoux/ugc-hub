"use server";

import { eq } from "drizzle-orm";
import { creatorFolders } from "@/db/schema";
import { db } from "@/shared/lib/db";

export async function getCreatorContent(creatorId: string) {
  const folders = await db.query.creatorFolders.findMany({
    where: eq(creatorFolders.creatorId, creatorId),
    with: {
      submission: {
        columns: { id: true, name: true },
      },
      creatorSubmissions: {
        with: {
          assets: {
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
      isNew: batch.isNew,
      assets: batch.assets,
    })),
  }));
}

export type CreatorContent = Awaited<ReturnType<typeof getCreatorContent>>;
