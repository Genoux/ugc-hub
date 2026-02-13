import Image from "next/image";

type AssetCardProps = {
  src: string | null;
  filename: string;
  isVideo: boolean;
  isLoading?: boolean;
  action?: React.ReactNode;
};

export function AssetCard({ src, filename, isVideo, isLoading, action }: AssetCardProps) {
  return (
    <div className="break-inside-avoid mb-2 relative group rounded overflow-hidden bg-card">
      {isLoading ? (
        <div className="aspect-video w-full animate-pulse bg-card" />
      ) : (
        src &&
        (isVideo ? (
          <video src={src} controls className="w-full">
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
      <div
        className="flex items-start justify-between backdrop-blur-md p-2 absolute top-0 left-0 w-full h-14 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          maskImage: "linear-gradient(to bottom, black 50%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 50%, transparent 100%)",
        }}
      >
        <p className="truncate px-2 py-1 text-sm text-white">{filename}</p>
        {action}
      </div>
    </div>
  );
}
