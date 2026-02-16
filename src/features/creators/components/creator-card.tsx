import { Instagram, Music, Youtube } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/shared/components/ui/badge";
import type { Creator } from "../schemas";

interface CreatorCardProps {
  creator: Creator;
  onClick: () => void;
}

const RATING_CONFIG: Record<string, { className: string }> = {
  "top creator": {
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  standout: {
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  good: {
    className: "bg-sky-100 text-sky-700 border-sky-200",
  },
  sufficient: {
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
  problematic: {
    className: "bg-orange-100 text-orange-600 border-orange-200",
  },
  untested: {
    className: "bg-gray-50 text-gray-500 border-gray-200",
  },
  blacklisted: {
    className: "bg-rose-100 text-rose-700 border-rose-200",
  },
};

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
      className="group relative flex flex-col rounded-2xl bg-white border border-gray-100 p-5 transition-all hover:shadow-lg hover:border-gray-200 text-left"
    >
      <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-xl bg-gray-50">
        {creator.profilePhoto ? (
          <Image
            src={creator.profilePhoto}
            alt={creator.fullName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-5xl text-gray-300 font-light">
            {creator.fullName[0]}
          </div>
        )}
      </div>

      <h3 className="font-medium text-gray-900 text-base mb-2 truncate">{creator.fullName}</h3>

      <div className="flex items-center gap-2 mb-3">
        <Badge variant="outline" className={ratingConfig.className}>
          {creator.overallRating}
        </Badge>
        {ChannelIcon && (
          <div className="flex items-center justify-center h-5 w-5 rounded-full bg-gray-50">
            <ChannelIcon className="h-3 w-3 text-gray-400" />
          </div>
        )}
      </div>

      {topCategories.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {topCategories.map((cat) => (
            <Badge key={cat} variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
              {cat}
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-auto pt-2 text-xs text-gray-500 font-medium">{rateDisplay}</div>
    </button>
  );
}
