import { RATING_CONFIG, type OverallRatingTier } from "@/features/creators/constants";
import { cn } from "@/shared/lib/utils";

interface RatingBadgeProps {
  rating: string;
  className?: string;
}

export function RatingBadge({ rating, className }: RatingBadgeProps) {
  const config = RATING_CONFIG[rating as OverallRatingTier] ?? RATING_CONFIG.untested;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1.5 w-fit rounded-full text-xs font-medium tracking-wide",
        "bg-black/40 backdrop-blur-sm text-white",
        className,
      )}
    >
      <span
        className={cn("size-1.5 rounded-full shrink-0", config.dot)}
        aria-hidden
      />
      <span className="capitalize">{rating}</span>
    </span>
  );
}
