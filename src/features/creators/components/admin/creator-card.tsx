import { Instagram, Music, Youtube } from "lucide-react";
import Image from "next/image";
import type { CreatorListItem } from "@/features/creators/actions/admin/get-creators";
import { RatingBadge } from "@/features/creators/components/rating-badge";
import { Badge } from "@/shared/components/ui/badge";

interface CreatorCardProps {
  creator: CreatorListItem;
  onClick: () => void;
}

export function CreatorCard({ creator, onClick }: CreatorCardProps) {
  const topCategories = creator.ugcCategories?.slice(0, 2) || [];
  const rateRange = creator.rateRangeInternal || creator.rateRangeSelf;
  const rateDisplay = rateRange ? `$${rateRange.min}-$${rateRange.max}` : "Rate TBD";

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex flex-col rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-accent/50 hover:border-border"
    >
      <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-lg bg-muted flex items-center justify-center text-4xl font-light text-muted-foreground">
        <Image
          src={creator.profilePhotoUrl || ""}
          alt={creator.fullName}
          fill
          className="object-cover flex items-center justify-center text-sm"
        />
      </div>

      <h3 className="font-medium text-foreground text-sm mb-2 truncate">{creator.fullName}</h3>

      <div className="flex items-center gap-2 mb-2">
        <RatingBadge rating={creator.overallRating} />
      </div>

      {topCategories.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {topCategories.map((cat) => (
            <Badge key={cat} variant="secondary" className="text-xs font-normal">
              {cat}
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-auto pt-1.5 text-xs font-medium text-muted-foreground">{rateDisplay}</div>
    </button>
  );
}
