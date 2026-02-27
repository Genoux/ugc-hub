"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { AssetCard } from "@/shared/components/blocks/asset-card";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

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
      isVideo={file.type.startsWith("video/")}
      size={size}
      action={
        onRemove && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  className="hover:opacity-50"
                  onClick={onRemove}
                  variant="link"
                  size="icon-sm"
                >
                  <X className="size-4 text-white" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Remove asset</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      }
    />
  );
}

type FileListProps = {
  files: File[];
  onRemove?: (index: number) => void;
  size?: "sm" | "md" | "lg";
};

export function FileList({ files, onRemove, size = "md" }: FileListProps) {
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
