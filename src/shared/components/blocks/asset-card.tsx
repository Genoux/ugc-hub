"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/shared/lib/utils";

const SIZE = {
  xs: "w-32",
  sm: "w-42",
  md: "w-52",
  lg: "w-64",
} as const;

function useVideoThumbnail(src: string | null): string | null {
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  useEffect(() => {
    if (!src) return;
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";

    const draw = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")?.drawImage(video, 0, 0);
      setThumbnail(canvas.toDataURL("image/jpeg", 0.8));
      video.src = "";
    };

    video.addEventListener("loadeddata", draw);
    video.src = src;
    video.load();

    return () => {
      video.removeEventListener("loadeddata", draw);
      video.src = "";
    };
  }, [src]);

  return thumbnail;
}

type AssetThumbnailProps = {
  src: string | null;
  filename: string;
  className?: string;
};

export function AssetThumbnail({ src, filename, className }: AssetThumbnailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const thumbnail = useVideoThumbnail(near ? src : null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !src) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [src]);

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden bg-muted", className)}>
      {thumbnail && (
        <Image
          unoptimized
          fill
          src={thumbnail}
          alt={filename}
          className="absolute inset-0 h-full w-full object-cover"
        />
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
  const containerRef = useRef<HTMLFieldSetElement>(null);
  const [isNear, setIsNear] = useState(false);
  const thumbnail = useVideoThumbnail(isNear ? src : null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !src) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [src]);

  return (
    <fieldset
      ref={containerRef}
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
            src={isNear ? src : undefined}
            poster={thumbnail ?? undefined}
            controls
            preload="none"
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
