"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { EASING_FUNCTION } from "@/shared/lib/constant";
import { cn } from "@/shared/lib/utils";

type AssetCardProps = {
  src: string | null;
  filename: string;
  isVideo: boolean;
  isLoading?: boolean;
  action?: React.ReactNode;
  className?: string;
};

export function AssetCard({
  src,
  filename,
  isVideo,
  isLoading,
  action,
  className,
}: AssetCardProps) {
  const [ready, setReady] = useState(false);
  const [aspectRatio, setAspectRatio] = useState("9/16");

  function handleVideoMetadata(e: React.SyntheticEvent<HTMLVideoElement>) {
    const { videoWidth, videoHeight } = e.currentTarget;
    if (videoWidth && videoHeight) setAspectRatio(`${videoWidth}/${videoHeight}`);
    setReady(true);
  }

  return (
    <div
      className={cn(
        "break-inside-avoid border relative group rounded-lg overflow-hidden bg-muted cursor-pointer",
        className,
      )}
    >
      <div className="relative w-full bg-muted" style={{ aspectRatio }}>
        {(isLoading || !ready) && <div className="absolute inset-0 animate-pulse bg-muted" />}

        {!isLoading && src && (
          <motion.video
            src={src}
            controls
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
    </div>
  );
}
