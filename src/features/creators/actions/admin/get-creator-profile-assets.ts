"use server";

import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { and, eq } from "drizzle-orm";
import { creatorCollaborations, creatorPortfolioAssets, creatorProfileAssets } from "@/db/schema";
import { R2_BUCKET_NAME, r2Client } from "@/features/uploads/lib/r2-client";
import { db } from "@/shared/lib/db";

const URL_EXPIRES = 3600;

export type ProfileAssetWithUrl = {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
};

export type ClosedCollaboration = {
  id: string;
  submissionName: string;
  closedAt: Date;
  piecesOfContent: number | null;
  totalPaidCents: number | null;
  ratingVisualQuality: string | null;
  ratingActingDelivery: string | null;
  ratingReliabilitySpeed: string | null;
  reviewNotes: string | null;
  portfolioAssets: ProfileAssetWithUrl[];
};

export type CreatorProfileAssetsResult = {
  pastWork: ProfileAssetWithUrl[];
  closedCollaborations: ClosedCollaboration[];
};

export async function getCreatorProfileAssets(
  creatorId: string,
): Promise<CreatorProfileAssetsResult> {
  const sign = async (r2Key: string) =>
    getSignedUrl(
      r2Client,
      new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: r2Key }),
      { expiresIn: URL_EXPIRES },
    );

  const [pastWorkRows, closedCollabRows] = await Promise.all([
    db.query.creatorProfileAssets.findMany({
      where: and(
        eq(creatorProfileAssets.creatorId, creatorId),
        eq(creatorProfileAssets.assetType, "portfolio_video"),
      ),
      columns: { id: true, filename: true, mimeType: true, sizeBytes: true, r2Key: true },
      orderBy: (a, { desc }) => [desc(a.createdAt)],
    }),
    db.query.creatorCollaborations.findMany({
      where: and(
        eq(creatorCollaborations.creatorId, creatorId),
        eq(creatorCollaborations.collaborationStatus, "closed"),
      ),
      with: {
        submission: { columns: { name: true } },
        creatorPortfolioAssets: {
          columns: { id: true, filename: true, mimeType: true, sizeBytes: true, r2Key: true },
        },
      },
      orderBy: (c, { desc }) => [desc(c.closedAt)],
    }),
  ]);

  const pastWork = await Promise.all(
    pastWorkRows.map(async (row) => ({
      id: row.id,
      filename: row.filename,
      mimeType: row.mimeType,
      sizeBytes: row.sizeBytes,
      url: await sign(row.r2Key),
    })),
  );

  const closedCollaborations = await Promise.all(
    closedCollabRows.map(async (collab) => ({
      id: collab.id,
      submissionName: collab.submission.name,
      closedAt: collab.closedAt!,
      piecesOfContent: collab.piecesOfContent,
      totalPaidCents: collab.totalPaid,
      ratingVisualQuality: collab.ratingVisualQuality,
      ratingActingDelivery: collab.ratingActingDelivery,
      ratingReliabilitySpeed: collab.ratingReliabilitySpeed,
      reviewNotes: collab.reviewNotes,
      portfolioAssets: await Promise.all(
        collab.creatorPortfolioAssets.map(async (asset) => ({
          id: asset.id,
          filename: asset.filename,
          mimeType: asset.mimeType,
          sizeBytes: asset.sizeBytes,
          url: await sign(asset.r2Key),
        })),
      ),
    })),
  );

  return { pastWork, closedCollaborations };
}
