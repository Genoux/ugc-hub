"use client";

import { X } from "lucide-react";
import { toast } from "sonner";
import { AssetVideo } from "@/shared/components/blocks/asset-card";
import { AssetFileList } from "@/shared/components/blocks/asset-file-list";
import { FileDropZone } from "@/shared/components/blocks/file-drop-zone";
import { Button } from "@/shared/components/ui/button";

export type PortfolioFile = {
  file: File;
  key: string;
  uploaded: boolean;
};

export type ExistingPortfolioHighlight = {
  id: string;
  r2Key: string;
  filename: string;
  url: string;
};

interface StepPortfolioProps {
  files: PortfolioFile[];
  onFilesAdd: (files: File[]) => void;
  onFileRemove: (index: number) => void;
  existingHighlights?: ExistingPortfolioHighlight[];
  onExistingRemove?: (r2Key: string) => void;
}

export function StepPortfolio({
  files,
  onFilesAdd,
  onFileRemove,
  existingHighlights,
  onExistingRemove,
}: StepPortfolioProps) {
  function handleInvalidFiles(rejected: { names: string[]; reason: "type" | "size" }) {
    if (rejected.reason === "type") toast.error("File type not supported");
    else toast.error("File too large (max 500MB)");
  }

  function handleRemoveFile(index: number) {
    onFileRemove(index);
  }

  const fileList = files.map((pf) => pf.file);

  return (
    <div className="space-y-2">
      {existingHighlights && existingHighlights.length > 0 && onExistingRemove && (
        <div className="flex w-full min-w-0 gap-1 overflow-x-auto pb-1">
          {existingHighlights.map((h) => (
            <div key={h.r2Key} className="shrink-0">
              <AssetVideo
                src={h.url}
                filename={h.filename}
                size="xs"
                actionSlot={
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => onExistingRemove(h.r2Key)}
                    className="h-7 w-7 text-white! hover:bg-white/20"
                    title="Remove"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                }
              />
            </div>
          ))}
        </div>
      )}
      {fileList.length > 0 && (
        <AssetFileList size="sm" files={fileList} onRemove={handleRemoveFile} />
      )}

      <FileDropZone
        onFilesAdd={onFilesAdd}
        onInvalidFiles={handleInvalidFiles}
        hint="MP4, MOV, images up to 500MB each"
      />
    </div>
  );
}
