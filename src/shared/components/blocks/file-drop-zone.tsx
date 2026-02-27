"use client";

import { Upload } from "lucide-react";
import { useRef } from "react";
import { UPLOAD_CONFIG } from "@/features/uploads/lib/upload-config";
import { cn } from "@/shared/lib/utils";

type AllowedMime = (typeof UPLOAD_CONFIG.allowedMimeTypes)[number];

interface FileDropZoneProps {
  onFilesAdd: (files: File[]) => void;
  accept?: readonly string[];
  maxFileSize?: number;
  multiple?: boolean;
  onInvalidFiles?: (rejected: { names: string[]; reason: "type" | "size" }) => void;
  className?: string;
  hint?: string;
  children?: React.ReactNode;
}

const defaultAccept = UPLOAD_CONFIG.allowedMimeTypes as unknown as AllowedMime[];
const defaultMaxSize = UPLOAD_CONFIG.maxFileSize;

export function FileDropZone({
  onFilesAdd,
  accept = defaultAccept,
  maxFileSize = defaultMaxSize,
  multiple = true,
  onInvalidFiles,
  className,
  hint = "MP4, MOV, images up to 500MB each",
  children,
}: FileDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function processFiles(candidates: File[]) {
    const valid: File[] = [];
    const invalidType: string[] = [];
    const invalidSize: string[] = [];

    for (const file of candidates) {
      if (!(accept as readonly string[]).includes(file.type)) {
        invalidType.push(file.name);
      } else if (file.size > maxFileSize) {
        invalidSize.push(file.name);
      } else {
        valid.push(file);
      }
    }

    if (invalidType.length && onInvalidFiles)
      onInvalidFiles({ names: invalidType, reason: "type" });
    if (invalidSize.length && onInvalidFiles)
      onInvalidFiles({ names: invalidSize, reason: "size" });
    if (valid.length) onFilesAdd(multiple ? valid : valid.slice(0, 1));
  }

  function handleDrop(e: React.DragEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    if (files.length) processFiles(files);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length) processFiles(files);
    e.target.value = "";
  }

  return (
    <button
      type="button"
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border p-8 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring hover:border-foreground/30 hover:bg-muted/30",
        className,
      )}
    >
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={accept.join(",")}
        className="sr-only"
        onChange={handleChange}
      />
      {children ?? (
        <>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted">
            <Upload className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">Click to upload or drag and drop</p>
            <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
          </div>
        </>
      )}
    </button>
  );
}
