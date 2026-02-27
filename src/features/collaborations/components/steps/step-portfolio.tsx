"use client";

import { FileVideo, Info, Trash2 } from "lucide-react";
import { FileDropZone } from "@/shared/components/blocks/file-drop-zone";

export type PortfolioFile = {
  file: File;
  key: string; // R2 key assigned after upload
  uploaded: boolean;
};

interface StepPortfolioProps {
  creatorName: string;
  files: PortfolioFile[];
  isUploading: boolean;
  onFilesAdd: (files: File[]) => void;
  onFileRemove: (index: number) => void;
}

export function StepPortfolio({
  creatorName,
  files,
  isUploading,
  onFilesAdd,
  onFileRemove,
}: StepPortfolioProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-xl bg-primary/8 border border-primary/20 px-4 py-3">
        <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <p className="text-sm text-foreground/80">
          Upload the{" "}
          <span className="font-semibold text-foreground">best version of each variation</span> to
          add to <span className="font-semibold text-foreground">{creatorName}</span>&apos;s project
          portfolio. This is optional — you can skip and close now.
        </p>
      </div>

      <FileDropZone
        onFilesAdd={onFilesAdd}
        hint="MP4, MOV, images up to 500MB each"
        className="w-full"
      />

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            {files.length} file{files.length > 1 ? "s" : ""} selected
          </p>
          {files.map((pf, i) => (
            <div
              key={`${pf.file.name}-${i}`}
              className="flex items-center justify-between bg-muted/60 rounded-lg px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <FileVideo className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground truncate max-w-[280px]">
                    {pf.file.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {(pf.file.size / (1024 * 1024)).toFixed(1)} MB
                    {pf.uploaded && (
                      <span className="ml-2 text-emerald-600 font-medium">✓ Uploaded</span>
                    )}
                    {isUploading && !pf.uploaded && (
                      <span className="ml-2 text-muted-foreground">Uploading...</span>
                    )}
                  </p>
                </div>
              </div>
              {!isUploading && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFileRemove(i);
                  }}
                  className="p-1.5 rounded-lg hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
