"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";

interface DownloadButtonProps {
  url: string;
  filename: string;
  className?: string;
}

export function DownloadButton({ url, filename, className }: DownloadButtonProps) {
  return (
    <Button
      variant="default"
      size="icon"
      className={className}
      onClick={async (e) => {
        e.stopPropagation();
        try {
          const blob = await fetch(url).then((r) => r.blob());
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = blobUrl;
          a.download = filename;
          a.click();
          URL.revokeObjectURL(blobUrl);
        } catch {
          toast.error("Download failed");
        }
      }}
    >
      <Download className="h-4 w-4" />
      <span className="sr-only">Download</span>
    </Button>
  );
}
