import { Download } from "lucide-react";
import { toast } from "sonner";
import { AssetCard } from "@/shared/components/blocks/asset-card";
import { downloadAssets } from "@/features/projects/lib/download-assets";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/components/ui/carousel";

interface Asset {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
}

interface AssetCarouselProps {
  assets: Asset[];
  emptyLabel: string;
}

export function AssetCarousel({
  assets,
  emptyLabel,
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
              size="sm"
              action={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                await downloadAssets(
                  [{ id: asset.id, filename: asset.filename, url: asset.url }],
                  { onError: () => toast.error("Download failed") },
                );
              }}
              buttonIcon={<Download className="h-4 w-4" />}
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
