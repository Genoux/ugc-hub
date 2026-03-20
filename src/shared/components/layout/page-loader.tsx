import { Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export function PageLoader({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-1 items-center justify-center", className)}>
      <Loader2 className="size-4 animate-spin " />
      <span className="text-sm text-muted-foreground"></span>
    </div>
  );
}
