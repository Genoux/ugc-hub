import { AssetCard } from "@/shared/components/blocks/asset-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/components/ui/carousel";
import { DownloadButton } from "./download-button";

interface Asset {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
}

interface AssetCarouselProps {
  assets: Asset[];
  emptyLabel: string;
  downloadButtonClassName?: string;
}

export function AssetCarousel({
  assets,
  emptyLabel,
  downloadButtonClassName,
}: AssetCarouselProps) {
  if (assets.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <Carousel
      className="w-full"
      opts={{ align: "start", loop: false, slidesToScroll: "auto" }}
      buttonPlacement="bottom-right"
      scrollDuration={20}
    >
      <CarouselContent>
        {assets.map((asset) => (
          <CarouselItem key={asset.id} className="basis-auto p-0">
            <AssetCard
              src={asset.url}
              filename={asset.filename}
              isVideo={asset.mimeType.startsWith("video/")}
              size="sm"
              action={
                <DownloadButton
                  url={asset.url}
                  filename={asset.filename}
                  className={downloadButtonClassName}
                />
              }
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex justify-end gap-1 mt-2">
        <CarouselPrevious />
        <CarouselNext />
      </div>
    </Carousel>
  );
}
