"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Sheet, SheetContent, SheetHeader } from "@/shared/components/ui/sheet";
import type { CreatorProfile } from "@/features/creators/actions/admin/get-creator-profile";
import { CreatorContent } from "./creator-content";
import { CreatorSidebar } from "./creator-sidebar";

interface CreatorOverlayProps {
  creator: CreatorProfile | null;
  hasPrev: boolean;
  hasNext: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function CreatorOverlay({
  creator,
  hasPrev,
  hasNext,
  onClose,
  onPrev,
  onNext,
}: CreatorOverlayProps) {
  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent side="bottom" showCloseButton={false} className="rounded-t-2xl overflow-hidden">
        <div className="flex h-[calc(100vh-5rem)] flex-col">
          <SheetHeader className="shrink-0 flex flex-row items-center justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onPrev}
                disabled={!hasPrev}
                aria-label="Previous creator"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onNext}
                disabled={!hasNext}
                aria-label="Next creator"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close creator profile"
            >
              <X className="h-5 w-5" />
            </Button>
          </SheetHeader>

          {creator && (
            <div className="flex flex-1 min-h-0">
              <CreatorSidebar creator={creator} />
              <CreatorContent creator={creator} />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
