import { Badge } from "@/shared/components/ui/badge";

type Status = "awaiting" | "pending" | "approved" | "rejected";

const statusConfig = {
  awaiting: {
    label: "no submissions",
    className: "text-muted-foreground border-border",
  },
  pending: {
    label: "ready for review",
    className:
      "text-orange-600 dark:text-orange-400 border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-950/30",
  },
  approved: {
    label: "approved",
    className:
      "text-green-600 dark:text-green-400 border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/30",
  },
  rejected: {
    label: "rejected",
    className:
      "text-red-600 dark:text-red-400 border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/30",
  },
} as const;

interface StatusBadgeProps {
  status?: Status;
  children?: React.ReactNode;
}

export function StatusBadge({ status, children }: StatusBadgeProps) {
  const config = status ? statusConfig[status] : null;

  return (
    <div>
      <Badge variant="outline" className={config ? config.className : "text-muted-foreground"}>
        {config ? config.label : children}
      </Badge>
    </div>
  );
}
