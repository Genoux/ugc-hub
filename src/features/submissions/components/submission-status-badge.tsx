import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";

type SubmissionStatus = "awaiting" | "pending" | "approved" | "rejected";

const statusConfig = {
  awaiting: {
    label: "no submissions yet",
    className: "text-muted-foreground border-muted-foreground bg-muted-foreground/10",
    iconClassName: "bg-muted-foreground",
  },
  pending: {
    label: "ready for review",
    className: "text-orange-500 border-orange-500 bg-orange-50",
    iconClassName: "bg-orange-600",
  },
  approved: {
    label: "approved",
    className: "text-green-500 border-green-500 bg-green-50",
    iconClassName: "bg-green-600",
  },
  rejected: {
    label: "rejected",
    className: "text-red-500 border-red-500 bg-red-50",
    iconClassName: "bg-red-500",
  },
} as const;

export function SubmissionStatusBadge({ status }: { status: SubmissionStatus }) {
  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={cn(config.className, "h-6 flex items-center")}>
      <span
        className={cn(
          "w-1.5 h-1.5 opacity-90 inline-block shrink-0 rounded-full hidden",
          config.iconClassName,
        )}
      />
      <span className="text-xs leading-none -mt-0.5">{config.label}</span>
    </Badge>
  );
}
