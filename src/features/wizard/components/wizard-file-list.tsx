"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
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

function FileItem({ file, onRemove }: { file: File; onRemove?: () => void }) {
  const objectUrl = useObjectUrl(file);
  const isVideo = file.type.startsWith("video/");

  return (
    <div className="break-inside-avoid mb-2 relative group rounded-lg overflow-hidden border bg-muted">
      {isVideo
        ? objectUrl && (
            <video src={objectUrl} controls className="w-full">
              <track kind="captions" />
            </video>
          )
        : objectUrl && (
            <Image
              src={objectUrl}
              alt={file.name}
              width={0}
              height={0}
              unoptimized
              className="w-full h-auto"
            />
          )}
      {onRemove && (
        <div
          className="flex items-start justify-end backdrop-blur-md p-2 absolute top-0 left-0 w-full h-14 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            maskImage: "linear-gradient(to bottom, black 50%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 50%, transparent 100%)",
          }}
        >
          <p className="truncate px-2 py-1 text-sm text-white">{file.name}</p>
          <Button
            type="button"
            className="hover:opacity-50"
            onClick={onRemove}
            variant="link"
            size="icon-sm"
          >
            <X className="size-4 text-white" />
          </Button>
        </div>
      )}
      <p className="truncate px-2 py-1 text-xs text-muted-foreground">{file.name}</p>
    </div>
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
