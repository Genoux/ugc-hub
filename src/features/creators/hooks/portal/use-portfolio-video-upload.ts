"use client";

import { useRef } from "react";
import { useFileUpload } from "@/features/uploads/hooks/use-file-upload";

export type UploadedVideoEntry = { file: File; key: string };

export function usePortfolioVideoUpload(creatorId: string) {
  const resultsRef = useRef<UploadedVideoEntry[]>([]);

  const { upload, isUploading } = useFileUpload({
    presign: async (file) => {
      const res = await fetch("/api/uploads/creator-profile/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorId,
          filename: file.name,
          mimeType: file.type,
          fileSize: file.size,
          assetType: "portfolio_video",
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "Failed to get upload URL");
      }
      return res.json();
    },
    onComplete: async (file, result) => {
      resultsRef.current.push({ file, key: result.key });
    },
  });

  function resetResults() {
    resultsRef.current = [];
  }

  return { upload, isUploading, resultsRef, resetResults };
}
