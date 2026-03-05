"use client";

import { useState } from "react";
import { putToR2 } from "@/features/uploads/lib/r2-upload";

export type CreatorProfileAssetType = "profile_picture" | "portfolio_video";

export interface UploadedCreatorAsset {
  key: string;
  filename: string;
  /** Only present for `portfolio_video` uploads — the `creator_profile_assets` row ID. */
  assetId?: string;
}

/**
 * Core upload logic: presign → PUT to R2 → DB record (for portfolio_video).
 * Stateless — safe to call concurrently for multiple files.
 */
export async function uploadCreatorAsset(
  creatorId: string,
  assetType: CreatorProfileAssetType,
  file: File,
): Promise<UploadedCreatorAsset> {
  const presignRes = await fetch("/api/uploads/creator-profile/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      creatorId,
      filename: file.name,
      mimeType: file.type,
      fileSize: file.size,
      assetType,
    }),
  });

  if (!presignRes.ok) {
    const body = await presignRes.json().catch(() => ({}));
    throw new Error(body.error ?? `Presign failed: ${presignRes.status}`);
  }

  const { uploadUrl, key } = await presignRes.json();

  await putToR2(file, uploadUrl);

  // profile_picture: stored directly on the creators row — no DB asset record needed.
  // portfolio_video: tracked in creator_profile_assets for individual management.
  if (assetType === "portfolio_video") {
    const completeRes = await fetch("/api/uploads/creator-profile/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creatorId,
        key,
        filename: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        assetType,
      }),
    });

    if (!completeRes.ok) {
      const body = await completeRes.json().catch(() => ({}));
      throw new Error(body.error ?? "Failed to record upload");
    }

    const { assetId } = await completeRes.json();
    return { key, filename: file.name, assetId };
  }

  return { key, filename: file.name };
}

interface UseCreatorAssetUploadReturn {
  upload: (file: File) => Promise<UploadedCreatorAsset>;
  uploading: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Single-file upload hook (used for profile photo).
 * Wraps uploadCreatorAsset with loading/error state.
 */
export function useCreatorAssetUpload(
  creatorId: string,
  assetType: CreatorProfileAssetType,
): UseCreatorAssetUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File): Promise<UploadedCreatorAsset> {
    setUploading(true);
    setError(null);
    try {
      return await uploadCreatorAsset(creatorId, assetType, file);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed. Please try again.";
      setError(message);
      throw err;
    } finally {
      setUploading(false);
    }
  }

  return { upload, uploading, error, clearError: () => setError(null) };
}
