"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { AssetCard } from "@/shared/components/blocks/asset-card";
import { Button } from "@/shared/components/ui/button";

function useObjectUrl(file: File) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return objectUrl;
}

function FileItem({
  file,
  onRemove,
  size,
}: {
  file: File;
  onRemove?: () => void;
  size?: "sm" | "md" | "lg";
}) {
  const objectUrl = useObjectUrl(file);

  return (
    <AssetCard
      src={objectUrl}
      filename={file.name}
      size={size}
      actionSlot={
        onRemove ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="h-8 w-8 text-white! hover:bg-white/20"
            title="Remove asset"
          >
            <X className="h-4 w-4" />
          </Button>
        ) : undefined
      }
    />
  );
}

export type AssetFileListProps = {
  files: File[];
  onRemove?: (index: number) => void;
  size?: "sm" | "md" | "lg";
};

export function AssetFileList({ files, onRemove, size = "md" }: AssetFileListProps) {
  return (
    <div className="flex w-full min-w-0 gap-1 overflow-x-auto pb-3">
      {files.map((file, idx) => (
        <div key={`${file.name}-${idx}`} className="shrink-0">
          <FileItem file={file} onRemove={onRemove ? () => onRemove(idx) : undefined} size={size} />
        </div>
      ))}
    </div>
  );
}

/** @deprecated Use AssetFileList */
export function FileList(props: AssetFileListProps) {
  return <AssetFileList {...props} />;
}
