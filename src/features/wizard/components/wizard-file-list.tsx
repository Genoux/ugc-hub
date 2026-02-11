"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { AssetCard } from "@/shared/components/asset-card";

function useObjectUrl(file: File) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return objectUrl;
}

function FileItem({ file, onRemove }: { file: File; onRemove?: () => void }) {
  const objectUrl = useObjectUrl(file);

  return (
    <AssetCard
      src={objectUrl}
      filename={file.name}
      isVideo={file.type.startsWith("video/")}
      action={
        onRemove && (
          <Button
            type="button"
            className="hover:opacity-50"
            onClick={onRemove}
            variant="link"
            size="icon-sm"
          >
            <X className="size-4 text-white" />
          </Button>
        )
      }
    />
  );
}

type FileListProps = {
  files: File[];
  onRemove?: (index: number) => void;
};

export function FileList({ files, onRemove }: FileListProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Selected Files ({files.length})</p>
      <div className="columns-2 gap-2">
        {files.map((file, idx) => (
          <FileItem
            key={`${file.name}-${idx}`}
            file={file}
            onRemove={onRemove ? () => onRemove(idx) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
