import { Loader2 } from "lucide-react";

export function PageLoader() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <Loader2 className="size-4 animate-spin " />
      <span className="text-sm text-muted-foreground"></span>
    </div>
  );
}
