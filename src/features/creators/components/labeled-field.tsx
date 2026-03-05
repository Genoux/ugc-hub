//TODO: Remove and use Field from shadcn/ui

import { cn } from "@/shared/lib/utils";

interface LabeledFieldProps {
  label: string;
  value?: React.ReactNode;
  className?: string;
}

export function LabeledField({ label, value, className }: LabeledFieldProps) {
  if (!value) return null;
  return (
    <div className={cn("flex flex-col items-start justify-between gap-2", className)}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}
