import { RATING_CONFIG } from "@/features/creators/constants";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";

interface RatingBadgeProps {
  rating: string;
  className?: string;
}

export function RatingBadge({ rating, className }: RatingBadgeProps) {
  const config = RATING_CONFIG[rating] ?? RATING_CONFIG.untested;
  return (
    <Badge variant="outline" className={cn("text-xs", config.className, className)}>
      {rating}
    </Badge>
  );
}
