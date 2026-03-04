"use client";

import { toast } from "sonner";
import { AssetFileList } from "@/shared/components/blocks/asset-file-list";
import { FileDropZone } from "@/shared/components/blocks/file-drop-zone";

interface StepUploadAssetsProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  projectName: string;
}

export function StepUploadAssets({ projectName, files, onFilesChange }: StepUploadAssetsProps) {
  function handleInvalidFiles(rejected: { names: string[]; reason: "type" | "size" }) {
    if (rejected.reason === "type") toast.error("File type not supported");
    else toast.error("File too large (max 500MB)");
  }

  function handleRemoveFile(index: number) {
    onFilesChange(files.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">Project: {projectName}</p>

      {files.length > 0 && <AssetFileList files={files} onRemove={handleRemoveFile} />}

      <FileDropZone
        onFilesAdd={(added) => onFilesChange([...files, ...added])}
        onInvalidFiles={handleInvalidFiles}
        hint="MP4, MOV, images up to 500MB each"
      />
    </div>
  );
}
