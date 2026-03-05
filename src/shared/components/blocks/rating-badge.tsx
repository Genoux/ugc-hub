//TODO: What if the top creator is manually set by the team, so they get the top creator + the verified badge? If not, is the top rating 'standout'?

import { type OverallRatingTier, RATING_CONFIG } from "@/shared/lib/constants";
import { cn } from "@/shared/lib/utils";

interface RatingBadgeProps {
  rating: string;
  className?: string;
  color?: "black" | "white";
}

export function RatingBadge({ rating, className, color = "black" }: RatingBadgeProps) {
  const config = RATING_CONFIG[rating as OverallRatingTier] ?? RATING_CONFIG.untested;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1.5 w-fit rounded-full text-xs font-medium tracking-wide",
        color === "black"
          ? "bg-black/40 backdrop-blur-sm text-white"
          : "bg-black/5 border border-black/10 backdrop-blur-sm text-black",
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full shrink-0", config.dot)} aria-hidden />
      <span className="capitalize">{rating}</span>
    </span>
  );
}
