import Image from "next/image";
import type { CreatorListItem } from "@/features/creators/actions/admin/get-creators";
import { RatingBadge } from "@/features/creators/components/rating-badge";
import { VerifiedBadge } from "@/shared/components/icons/verified-badge";
import { Squircle } from "@squircle-js/react";
import { Button } from "@/shared/components/ui/button";

interface CreatorCardProps {
  creator: CreatorListItem;
  onClick: () => void;
}

export function CreatorCard({ creator, onClick }: CreatorCardProps) {
  const rateRange = creator.rateRangeInternal || creator.rateRangeSelf;
  const rateDisplay = rateRange ? `$${rateRange.min}-$${rateRange.max}` : "Rate TBD";

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-3xl cursor-pointer group relative h-[400px] aspect-square w-full overflow-hidden"
    >
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={creator.profilePhotoUrl || ""}
          alt={creator.fullName}
          fill
          unoptimized
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-[55%] bg-black/20 backdrop-blur-md pointer-events-none"
          style={{
            maskImage: "linear-gradient(to top, black 0%, black 50%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to top, black 0%, black 50%, transparent 100%)",
          }}
        />
        <div className="absolute inset-0 flex flex-col bg-linear-to-b from-transparent to-black/60 p-4">
          <div className="flex justify-start">
            <RatingBadge rating={creator.overallRating} />
          </div>
          <div className="mt-auto flex flex-col gap-1">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white text-xl truncate">{creator.fullName}</h3>
                {creator.overallRating === "top creator" && (
                  <VerifiedBadge className="size-5" />
                )}
              </div>
              <div className="text-sm text-left font-semibold text-white/80">{rateDisplay}</div>
            </div>
            <div className="flex flex-wrap gap-0.5 pt-1">
              <Button size="lg" className="w-full backdrop-blur-sm bg-white/10 hover:bg-white/20">
                View Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    </button>


  );
}
