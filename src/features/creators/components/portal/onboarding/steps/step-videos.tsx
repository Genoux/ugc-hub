"use client";

import { Loader2, X } from "lucide-react";
import { useState } from "react";
import { uploadCreatorAsset } from "@/features/creators/hooks/use-creator-asset-upload";
import {
  MAX_PORTFOLIO_VIDEOS,
  MIN_PORTFOLIO_VIDEOS,
} from "@/features/creators/lib/onboarding-utils";
import { AssetCard } from "@/shared/components/blocks/asset-card";
import { FileDropZone } from "@/shared/components/blocks/file-drop-zone";
import { Button } from "@/shared/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/components/ui/carousel";
import type { PortfolioVideoEntry, UploadingVideoEntry } from "../onboarding-types";

const ACCEPTED_TYPES = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"] as const;

interface Props {
  doneEntries: PortfolioVideoEntry[];
  uploadingEntries: UploadingVideoEntry[];
  onEntryAdd: (entry: PortfolioVideoEntry) => void;
  onEntryRemove: (assetId: string) => void;
  onUploadStart: (entry: UploadingVideoEntry) => void;
  onUploadEnd: (tempId: string) => void;
  creatorId: string;
}

export function StepVideos({
  doneEntries,
  uploadingEntries,
  onEntryAdd,
  onEntryRemove,
  onUploadStart,
  onUploadEnd,
  creatorId,
}: Props) {
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
      {doneEntries.length > 0 && (
        <Carousel
          opts={{ align: "start", loop: false }}
          className="w-full flex flex-col gap-3"
          buttonPlacement="bottom-right"
          scrollDuration={20}
        >
          <CarouselContent>
            {doneEntries.map((entry) => (
              <CarouselItem key={entry.assetId} className="basis-auto p-0">
                <AssetCard
                  src={entry.objectUrl}
                  filename={entry.filename}
                  size="sm"
                  action={
                    <Button
                      className="h-8 w-8 text-white! hover:bg-white/20"
                      variant="ghost"
                      size="icon"
                      onClick={() => onEntryRemove(entry.assetId)}
                    >
                      <X className="size-3.5" />
                    </Button>
                  }
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex items-center gap-2 justify-between">
            <div className="mb-1">
              <p className="text-xs text-muted-foreground">
                {doneEntries.length} / {MAX_PORTFOLIO_VIDEOS}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <CarouselPrevious />
              <CarouselNext />
            </div>
          </div>
        </Carousel>
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

      {errors.map((err) => (
        <p key={err} className="text-destructive text-sm">
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
