"use server";

import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { and, eq } from "drizzle-orm";
import { creatorProfileAssets, creatorPortfolioAssets } from "@/db/schema";
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

export type CreatorProfileAssetsResult = {
  pastWork: ProfileAssetWithUrl[];
  creatorPortfolioAssets: ProfileAssetWithUrl[];
};

export async function getCreatorProfileAssets(
  creatorId: string,
): Promise<CreatorProfileAssetsResult> {
  const pastWorkRows = await db.query.creatorProfileAssets.findMany({
    where: and(
      eq(creatorProfileAssets.creatorId, creatorId),
      eq(creatorProfileAssets.assetType, "past_work"),
    ),
    columns: { id: true, filename: true, mimeType: true, sizeBytes: true, r2Key: true },
    orderBy: (a, { desc }) => [desc(a.createdAt)],
  });
  const portfolioRows = await db.query.creatorPortfolioAssets.findMany({
    where: eq(creatorPortfolioAssets.creatorId, creatorId),
    columns: { id: true, filename: true, mimeType: true, sizeBytes: true, r2Key: true },
    orderBy: (a, { desc }) => [desc(a.createdAt)],
  });

  const sign = async (r2Key: string) =>
    getSignedUrl(
      r2Client,
      new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: r2Key }),
      { expiresIn: URL_EXPIRES },
    );

  const [pastWorkWithUrls, portfolioWithUrls] = await Promise.all([
    Promise.all(
      pastWorkRows.map(async (row) => ({
        id: row.id,
        filename: row.filename,
        mimeType: row.mimeType,
        sizeBytes: row.sizeBytes,
        url: await sign(row.r2Key),
      })),
    ),
    Promise.all(
      portfolioRows.map(async (row) => ({
        id: row.id,
        filename: row.filename,
        mimeType: row.mimeType,
        sizeBytes: row.sizeBytes,
        url: await sign(row.r2Key),
      })),
    ),
  ]);

  return { pastWork: pastWorkWithUrls, creatorPortfolioAssets: portfolioWithUrls };
}
