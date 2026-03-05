"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { DownloadableAsset } from "@/features/projects/lib/download-assets";
import { downloadAssets } from "@/features/projects/lib/download-assets";
import { Button } from "@/shared/components/ui/button";

type DownloadButtonProps = Omit<React.ComponentProps<typeof Button>, "onClick"> & {
  assets: DownloadableAsset[];
  zipName?: string;
  /** Called instead of downloading when assets is empty */
  onEmpty?: () => void;
  /** Calls e.preventDefault() + e.stopPropagation() before downloading */
  stopPropagation?: boolean;
};

export function DownloadButton({
  assets,
  zipName,
  onEmpty,
  stopPropagation,
  children,
  ...props
}: DownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (stopPropagation) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (assets.length === 0) {
      onEmpty?.();
      return;
    }
    setIsLoading(true);
    try {
      await downloadAssets(assets, {
        onError: (filename) => toast.error(`Failed to download ${filename}`),
        zipName,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button {...props} disabled={isLoading || props.disabled} onClick={handleClick}>
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {assets.length === 1 ? null : "Preparing assets..."}
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          {children}
        </>
      )}
    </Button>
  );
}
