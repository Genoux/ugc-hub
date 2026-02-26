"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { EASING_FUNCTION } from "@/shared/lib/constant";
import { cn } from "@/shared/lib/utils";

type AssetCardProps = {
  src: string | null;
  filename: string;
  /** Kept for API compatibility; asset card is video-only for now. */
  isVideo?: boolean;
  isLoading?: boolean;
  action?: React.ReactNode;
  className?: string;
};

export function AssetCard({ src, filename, isLoading, action, className }: AssetCardProps) {
  const [ready, setReady] = useState(false);
  const [showControls, setShowControls] = useState(false);

  function handleVideoMetadata(_e: React.SyntheticEvent<HTMLVideoElement>) {
    setReady(true);
  }

  return (
    <fieldset
      className={cn(
        "break-inside-avoid relative group rounded overflow-hidden bg-muted cursor-pointer border-none p-0 m-0 w-full aspect-9/16",
        className,
      )}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <div className="relative w-full h-full bg-muted">
        {(isLoading || !ready) && <div className="absolute inset-0 animate-pulse bg-muted" />}

        {!isLoading && src && (
          <motion.video
            src={src}
            controls={showControls}
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: ready ? 1 : 0 }}
            transition={{ duration: 0.3, ease: EASING_FUNCTION.exponential }}
            onLoadedMetadata={handleVideoMetadata}
          >
            <track kind="captions" />
          </motion.video>
        )}
      </div>
      <div className="flex items-start justify-between p-2 absolute top-0 left-0 w-full h-14 bg-linear-to-b from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="truncate px-2 py-1 text-sm text-white">{filename}</p>
        {action}
      </div>
    </fieldset>
  );
}
