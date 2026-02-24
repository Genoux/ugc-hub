import Image from "next/image";
import { cn } from "../lib/utils";

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
  return (
    <div
      className={cn(
        "break-inside-avoid border relative group rounded overflow-hidden bg-card cursor-pointer",
        className,
      )}
    >
      {isLoading ? (
        <div className="aspect-video w-full animate-pulse bg-card" />
      ) : (
        src &&
        (isVideo ? (
          <video src={src} controls className="w-full h-full object-cover">
            <track kind="captions" />
          </video>
        ) : (
          <Image
            src={src}
            alt={filename}
            width={800}
            height={800}
            loading="lazy"
            className="w-full h-auto"
          />
        ))
      )}
      <div className="flex items-start justify-between p-2 absolute top-0 left-0 w-full h-14 bg-linear-to-b from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="truncate px-2 py-1 text-sm text-white">{filename}</p>
        {action}
      </div>
    </div>
  );
}
