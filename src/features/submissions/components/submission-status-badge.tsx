import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";

type SubmissionStatus = "awaiting" | "pending" | "approved" | "rejected";

const statusConfig = {
  awaiting: {
    label: "awaiting",
    className: "text-gray-500 border-gray-500",
  },
  pending: {
    label: "pending",
    className: "text-orange-600 border-orange-600",
  },
  approved: {
    label: "approved",
    className: "text-green-600 border-green-600",
  },
  rejected: {
    label: "rejected",
    className: "text-red-600 border-red-600",
  },
} as const;

export function SubmissionStatusBadge({ status }: { status: SubmissionStatus }) {
  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={cn(config.className, "h-6")}>
      {config.label}
    </Badge>
  );
}
