"use client";

import { toast } from "sonner";
import { AssetFileList } from "@/shared/components/blocks/asset-file-list";
import { FileDropZone } from "@/shared/components/blocks/file-drop-zone";

export type PortfolioFile = {
  file: File;
  key: string;
  uploaded: boolean;
};

interface StepPortfolioProps {
  creatorName: string;
  files: PortfolioFile[];
  isUploading: boolean;
  onFilesAdd: (files: File[]) => void;
  onFileRemove: (index: number) => void;
}

export function StepPortfolio({ files, onFilesAdd, onFileRemove }: StepPortfolioProps) {
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
      {fileList.length > 0 && <AssetFileList files={fileList} onRemove={handleRemoveFile} />}

      <FileDropZone
        onFilesAdd={onFilesAdd}
        onInvalidFiles={handleInvalidFiles}
        hint="MP4, MOV, images up to 500MB each"
      />
    </div>
  );
}
