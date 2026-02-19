import { Instagram, Music, Youtube } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/shared/components/ui/badge";
import { RATING_CONFIG } from "../constants";
import type { Creator } from "../schemas";

interface CreatorCardProps {
  creator: Creator;
  onClick: () => void;
}

const CHANNEL_ICON_MAP = {
  Instagram: Instagram,
  TikTok: Music,
  YouTube: Youtube,
};

export function CreatorCard({ creator, onClick }: CreatorCardProps) {
  const ratingConfig = RATING_CONFIG[creator.overallRating] || RATING_CONFIG.untested;
  const ChannelIcon = creator.primaryChannel
    ? CHANNEL_ICON_MAP[creator.primaryChannel as keyof typeof CHANNEL_ICON_MAP]
    : null;

  const topCategories = creator.ugcCategories?.slice(0, 2) || [];
  const rateRange = creator.rateRangeInternal || creator.rateRangeSelf;
  const rateDisplay = rateRange ? `$${rateRange.min}-$${rateRange.max}` : "Rate TBD";

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex flex-col rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-accent/50 hover:border-border"
    >
      <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-lg bg-muted">
        {creator.profilePhoto ? (
          <Image
            src={creator.profilePhoto}
            alt={creator.fullName}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl font-light text-muted-foreground">
            {creator.fullName[0]}
          </div>
        )}
      </div>

      <h3 className="font-medium text-foreground text-sm mb-2 truncate">{creator.fullName}</h3>

      <div className="flex items-center gap-2 mb-2">
        <Badge variant="outline" className={ratingConfig.className}>
          {creator.overallRating}
        </Badge>
        {ChannelIcon && (
          <div className="flex items-center justify-center h-5 w-5 rounded-full bg-muted">
            <ChannelIcon className="h-3 w-3 text-muted-foreground" />
          </div>
        )}
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
