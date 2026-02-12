import { Badge } from "@/shared/components/ui/badge";

type Status = "awaiting" | "pending" | "approved" | "rejected";

const statusConfig = {
  awaiting: {
    label: "no submissions",
    className: "text-muted-foreground",
  },
  pending: {
    label: "ready for review",
    className: "text-orange-500 border-orange-500 bg-orange-50",
  },
  approved: {
    label: "approved",
    className: "text-green-500 border-green-500 bg-green-50",
  },
  rejected: {
    label: "rejected",
    className: "text-red-500 border-red-500 bg-red-50",
  },
} as const;

interface StatusBadgeProps {
  status?: Status;
  children?: React.ReactNode;
}

export function StatusBadge({ status, children }: StatusBadgeProps) {
  const config = status ? statusConfig[status] : null;

  return (
    <div className="w-32">
      <Badge variant="outline" className={config ? config.className : "text-muted-foreground"}>
        {config ? config.label : children}
      </Badge>
    </div>
  );
}
