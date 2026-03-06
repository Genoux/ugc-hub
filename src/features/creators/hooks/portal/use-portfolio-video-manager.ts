"use client";

import { useRef, useState } from "react";
import type {
  PortfolioVideoEntry,
  UploadingVideoEntry,
} from "../../components/portal/onboarding/onboarding-types";

export interface PortfolioVideoManager {
  doneEntries: PortfolioVideoEntry[];
  uploadingEntries: UploadingVideoEntry[];
  /** True while at least one upload is in flight. */
  isUploading: boolean;
  completedCount: number;
  add: (entry: PortfolioVideoEntry) => void;
  remove: (assetId: string) => void;
  uploadStart: (entry: UploadingVideoEntry) => void;
  uploadEnd: (tempId: string) => void;
  /** Deletes all newly-uploaded entries from R2 + DB. Awaitable — resolves when all deletes finish. */
  abandonAll: () => Promise<void>;
}

export function usePortfolioVideoManager(
  initialEntries?: PortfolioVideoEntry[],
): PortfolioVideoManager {
  const [doneEntries, setDoneEntries] = useState<PortfolioVideoEntry[]>(initialEntries ?? []);
  // Track IDs of videos that existed before this wizard session opened.
  // abandonAll must not delete pre-existing assets.
  const preExistingIds = useRef(new Set(initialEntries?.map((e) => e.assetId) ?? []));
  const [uploadingEntries, setUploadingEntries] = useState<UploadingVideoEntry[]>([]);

  const add = (entry: PortfolioVideoEntry) => {
    setDoneEntries((prev) => [...prev, entry]);
  };

  const remove = (assetId: string) => {
    setDoneEntries((prev) => {
      const removed = prev.find((e) => e.assetId === assetId);
      if (removed) URL.revokeObjectURL(removed.objectUrl);
      return prev.filter((e) => e.assetId !== assetId);
    });
    fetch(`/api/uploads/creator-profile/${assetId}`, { method: "DELETE" }).catch((err) =>
      console.error("[portfolio-video remove]", err),
    );
  };

  const uploadStart = (entry: UploadingVideoEntry) => {
    setUploadingEntries((prev) => [...prev, entry]);
  };

  const uploadEnd = (tempId: string) => {
    setUploadingEntries((prev) => prev.filter((e) => e.tempId !== tempId));
  };

  const abandonAll = async () => {
    await Promise.allSettled(
      doneEntries
        .filter((entry) => !preExistingIds.current.has(entry.assetId))
        .map((entry) => {
          URL.revokeObjectURL(entry.objectUrl);
          return fetch(`/api/uploads/creator-profile/${entry.assetId}`, {
            method: "DELETE",
          }).catch((err) => console.error("[wizard abandon cleanup]", err));
        }),
    );
  };

  return {
    doneEntries,
    uploadingEntries,
    isUploading: uploadingEntries.length > 0,
    completedCount: doneEntries.length,
    add,
    remove,
    uploadStart,
    uploadEnd,
    abandonAll,
  };
}
