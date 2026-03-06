import Image from "next/image";
import type { CreatorProfile } from "@/features/creators/actions/portal/get-creator-profile";
import { AssetCard } from "@/shared/components/blocks/asset-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/components/ui/carousel";

interface ProfilePortfolioProps {
  creator: Pick<
    CreatorProfile,
    "ugcCategories" | "contentFormats" | "portfolioVideos" | "closedCollaborations"
  >;
}

export function ProfilePortfolio({ creator }: ProfilePortfolioProps) {
  const hasHighlights = creator.closedCollaborations.some((c) => c.highlights.length > 0);

  return (
    <div className="flex flex-col gap-4">
      <Carousel
        className="w-full p-1"
        opts={{ align: "start", loop: false, slidesToScroll: "auto" }}
        buttonPlacement="bottom-right"
        scrollDuration={20}
      >
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-foreground items-center flex">Portfolio</h3>
          <CarouselContent>
            {creator.portfolioVideos.map((video) => (
              <CarouselItem key={video.id} className="basis-auto p-0">
                <AssetCard src={video.url} filename={video.filename} size="sm" />
              </CarouselItem>
            ))}
          </CarouselContent>
        </div>
        <div className="flex justify-end gap-1 mt-2">
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </Carousel>

      {hasHighlights && (
        <div className="flex flex-col gap-3">
          <div className="flex gap-1 items-center">
            <Image src="/logos/fieldtrip.svg" alt="Fieldtrip" width={12} height={12} />
            <h3 className="text-sm font-semibold text-foreground items-center flex">
              Fieldtrip portfolio
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {creator.closedCollaborations.flatMap((collab) =>
              collab.highlights.map((h) => (
                <AssetCard key={h.id} src={h.url} filename={h.filename} className="w-full" />
              )),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
