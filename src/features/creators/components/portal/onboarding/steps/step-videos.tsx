"use client";

import { X } from "lucide-react";
import { useState } from "react";
import {
  MAX_PORTFOLIO_VIDEOS,
  MIN_PORTFOLIO_VIDEOS,
} from "@/features/creators/lib/onboarding-utils";
import { AssetVideo } from "@/shared/components/blocks/asset-card";
import { FileDropZone } from "@/shared/components/blocks/file-drop-zone";
import { Button } from "@/shared/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/components/ui/carousel";
import { UPLOAD_SIZE_LIMITS } from "@/shared/lib/constants";

const ACCEPTED_TYPES = ["video/mp4", "video/quicktime", "video/webm"] as const;

interface ExistingVideo {
  id: string;
  url: string;
  filename: string;
}

interface PendingFile {
  file: File;
  objectUrl: string;
}

interface Props {
  existingVideos: ExistingVideo[];
  pendingFiles: PendingFile[];
  onExistingRemove: (id: string) => void;
  onFilesAdd: (files: File[]) => void;
  onFileRemove: (index: number) => void;
}

export function StepVideos({
  existingVideos,
  pendingFiles,
  onExistingRemove,
  onFilesAdd,
  onFileRemove,
}: Props) {
  const [errors, setErrors] = useState<{ id: string; message: string }[]>([]);
  const [movWarning, setMovWarning] = useState(false);

  const totalEntries = existingVideos.length + pendingFiles.length;
  const remaining = MIN_PORTFOLIO_VIDEOS - totalEntries;

  const handleFilesAdd = (files: File[]) => {
    const available = MAX_PORTFOLIO_VIDEOS - totalEntries;
    const toAdd = files.slice(0, available);

    if (toAdd.some((f) => f.name.toLowerCase().endsWith(".mov") || f.type === "video/quicktime")) {
      setMovWarning(true);
    }

    onFilesAdd(toAdd);
  };

  const allEntries = [
    ...existingVideos.map((v) => ({
      key: v.id,
      src: v.url,
      filename: v.filename,
      isExisting: true as const,
      id: v.id,
    })),
    ...pendingFiles.map((pf, i) => ({
      key: `pending-${i}`,
      src: pf.objectUrl,
      filename: pf.file.name,
      isExisting: false as const,
      index: i,
    })),
  ];

  return (
    <div className="space-y-4">
      {allEntries.length > 0 && (
        <Carousel
          opts={{ align: "start", loop: false }}
          className="w-full flex flex-col gap-3"
          buttonPlacement="bottom-right"
          scrollDuration={20}
        >
          <CarouselContent>
            {allEntries.map((entry) => (
              <CarouselItem key={entry.key} className="basis-auto p-0">
                <AssetVideo
                  src={entry.src}
                  filename={entry.filename}
                  size="xs"
                  actionSlot={
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        entry.isExisting ? onExistingRemove(entry.id) : onFileRemove(entry.index)
                      }
                      className="h-8 w-8 text-white! hover:bg-white/20"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  }
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex items-center gap-2 justify-between">
            <p className="text-xs text-muted-foreground mb-1">
              {totalEntries} / {MAX_PORTFOLIO_VIDEOS}
            </p>
          </div>
        </Carousel>
      )}

      {totalEntries < MAX_PORTFOLIO_VIDEOS && (
        <FileDropZone
          onFilesAdd={handleFilesAdd}
          accept={ACCEPTED_TYPES}
          maxFileSize={UPLOAD_SIZE_LIMITS.video}
          hint="MP4, MOV or WebM · Max 250 MB each"
          onInvalidFiles={(rejected) => {
            const message =
              rejected.reason === "type"
                ? "File type not supported. Use MP4, MOV or WebM."
                : "File too large (max 250 MB).";
            setErrors((prev) => [...prev, { id: crypto.randomUUID(), message }]);
          }}
        />
      )}

      {remaining > 0 && totalEntries > 0 && (
        <p className="text-xs text-muted-foreground">
          Add {remaining} more video{remaining !== 1 ? "s" : ""} to continue.
        </p>
      )}

      {movWarning && (
        <p className="text-amber-600 dark:text-amber-500 text-sm">
          MOV files may not play in all browsers. For guaranteed playback, export as MP4.
        </p>
      )}

      {errors.map(({ id, message }) => (
        <p key={id} className="text-destructive text-sm">
          {message}
        </p>
      ))}
    </div>
  );
}
