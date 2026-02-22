"use client";

import { Loader2, X } from "lucide-react";
import { useState } from "react";
import { uploadCreatorAsset } from "@/features/creators/hooks/use-creator-asset-upload";
import { AssetCard } from "@/shared/components/asset-card";
import { FileDropZone } from "@/shared/components/file-drop-zone";
import type { PortfolioVideoEntry, UploadingVideoEntry } from "../wizard-types";
import { MAX_PORTFOLIO_VIDEOS, MIN_PORTFOLIO_VIDEOS } from "../wizard-types";

const ACCEPTED_TYPES = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"] as const;

interface Props {
  /** Completed entries — owned by wizard shell, survive step navigation. */
  doneEntries: PortfolioVideoEntry[];
  /** In-progress entries — owned by wizard shell, survive step navigation. */
  uploadingEntries: UploadingVideoEntry[];
  onEntryAdd: (entry: PortfolioVideoEntry) => void;
  onEntryRemove: (assetId: string) => void;
  onUploadStart: (entry: UploadingVideoEntry) => void;
  onUploadEnd: (tempId: string) => void;
  creatorId: string;
}

export function Step6Videos({
  doneEntries,
  uploadingEntries,
  onEntryAdd,
  onEntryRemove,
  onUploadStart,
  onUploadEnd,
  creatorId,
}: Props) {
  // Errors are transient display-only feedback — fine to reset on navigation.
  const [errors, setErrors] = useState<string[]>([]);

  const totalEntries = doneEntries.length + uploadingEntries.length;

  const handleFilesAdd = (files: File[]) => {
    const toUpload = files.slice(0, MAX_PORTFOLIO_VIDEOS - totalEntries);

    for (const file of toUpload) {
      const tempId = crypto.randomUUID();
      const objectUrl = URL.createObjectURL(file);

      onUploadStart({ tempId, objectUrl, filename: file.name });

      uploadCreatorAsset(creatorId, "portfolio_video", file)
        .then((result) => {
          const { assetId } = result;
          if (!assetId) throw new Error("Upload did not return an asset ID");
          onEntryAdd({ assetId, key: result.key, filename: result.filename, objectUrl });
        })
        .catch((err) => {
          URL.revokeObjectURL(objectUrl);
          const message = err instanceof Error ? err.message : "Upload failed. Please try again.";
          setErrors((prev) => [...prev, message]);
        })
        .finally(() => onUploadEnd(tempId));
    }
  };

  const remaining = MIN_PORTFOLIO_VIDEOS - doneEntries.length;

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        Upload {MIN_PORTFOLIO_VIDEOS}–{MAX_PORTFOLIO_VIDEOS} of your best UGC videos. MP4, MOV or
        WebM · Max 500 MB each.
      </p>

      {doneEntries.length > 0 && (
        <div className="columns-2 gap-2">
          {doneEntries.map((entry) => (
            <AssetCard
              key={entry.assetId}
              src={entry.objectUrl}
              filename={entry.filename}
              isVideo
              action={
                <button
                  type="button"
                  onClick={() => onEntryRemove(entry.assetId)}
                  className="p-1 text-white transition-opacity hover:opacity-70"
                >
                  <X className="size-3.5" />
                </button>
              }
            />
          ))}
        </div>
      )}

      {uploadingEntries.length > 0 && (
        <div className="space-y-1.5">
          {uploadingEntries.map((entry) => (
            <div
              key={entry.tempId}
              className="flex items-center gap-2.5 rounded-lg border px-3 py-2.5"
            >
              <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" />
              <span className="truncate text-sm">{entry.filename}</span>
            </div>
          ))}
        </div>
      )}

      {totalEntries < MAX_PORTFOLIO_VIDEOS && (
        <FileDropZone
          onFilesAdd={handleFilesAdd}
          accept={ACCEPTED_TYPES}
          maxFileSize={500 * 1024 * 1024}
          hint="MP4, MOV or WebM · Max 500 MB each"
        />
      )}

      {errors.map((err, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: error list is append-only
        <p key={i} className="text-destructive text-sm">
          {err}
        </p>
      ))}

      {remaining > 0 && (
        <p className="text-muted-foreground text-xs">
          {remaining} more video{remaining > 1 ? "s" : ""} required to continue.
        </p>
      )}
    </div>
  );
}
