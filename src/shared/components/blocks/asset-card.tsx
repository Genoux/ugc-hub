"use client";

import { cn } from "@/shared/lib/utils";

const SIZE = {
  xs: "w-32",
  sm: "w-42",
  md: "w-52",
  lg: "w-64",
} as const;

type AssetThumbnailProps = {
  src: string | null;
  filename: string;
  className?: string;
};

export function AssetThumbnail({ src, filename, className }: AssetThumbnailProps) {
  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      {src && (
        <video
          src={src}
          muted
          playsInline
          preload="metadata"
          aria-label={filename}
          className="absolute inset-0 h-full w-full object-cover"
        >
          <track kind="captions" />
        </video>
      )}
    </div>
  );
}

type AssetVideoProps = {
  src: string | null;
  filename: string;
  actionSlot?: React.ReactNode;
  size?: keyof typeof SIZE;
  className?: string;
};

export function AssetVideo({
  src,
  filename,
  actionSlot,
  size,
  className,
}: AssetVideoProps) {
  return (
    <fieldset
      className={cn(
        "break-inside-avoid relative group rounded overflow-hidden bg-muted shrink-0 border-none p-0 m-0",
        size ? SIZE[size] : "w-full",
        className,
      )}
    >
      {/* Ratio anchor — video content is always 9:16 */}
      <div className="relative aspect-9/16 w-full bg-muted">
        {src && (
          <video
            src={src}
            controls
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover"
          >
            <track kind="captions" />
          </video>
        )}

        {/* Top overlay: filename + action */}
        <div className="flex items-start justify-between p-2 absolute top-0 left-0 w-full h-14 bg-linear-to-b from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <p className="truncate px-2 py-1 text-sm text-white">{filename}</p>
          {actionSlot && <div className="pointer-events-auto shrink-0">{actionSlot}</div>}
        </div>
      </div>
    </fieldset>
  );
}
