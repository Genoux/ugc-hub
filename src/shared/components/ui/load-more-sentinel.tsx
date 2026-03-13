import { Loader2 } from "lucide-react";
import type { RefObject } from "react";

export function LoadMoreSentinel({
  sentinelRef,
  isFetching,
}: {
  sentinelRef: RefObject<HTMLDivElement | null>;
  isFetching: boolean;
}) {
  return (
    <>
      <div ref={sentinelRef} className="h-px w-full" aria-hidden />
      {isFetching && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
        </div>
      )}
    </>
  );
}
