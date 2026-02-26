"use server";

import { eq } from "drizzle-orm";
import { collaborations } from "@/db/schema";
import { getR2SignedUrl } from "@/features/uploads/lib/r2-serve";
import { db } from "@/shared/lib/db";

export async function getCreatorSubmissions(creatorId: string) {
  const collabs = await db.query.collaborations.findMany({
    where: eq(collaborations.creatorId, creatorId),
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

  return Promise.all(
    collabs.map(async (collab) => ({
      projectId: collab.project.id,
      projectName: collab.project.name,
      status: collab.status,
      createdAt: collab.createdAt,
      submissions: await Promise.all(
        collab.submissions.map(async (submission) => ({
          id: submission.id,
          label: submission.label,
          submissionNumber: submission.submissionNumber,
          deliveredAt: submission.deliveredAt,
          assets: await Promise.all(
            submission.assets.map(async (asset) => ({
              id: asset.id,
              filename: asset.filename,
              mimeType: asset.mimeType,
              sizeBytes: asset.sizeBytes,
              url: (await getR2SignedUrl(asset.r2Key)) ?? "",
            })),
          ),
        })),
      ),
    })),
  );
}

export type CreatorSubmissions = Awaited<ReturnType<typeof getCreatorSubmissions>>;
