"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Info, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/shared/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/shared/components/ui/sheet";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="min-w-[368px] rounded-t-2xl overflow-hidden"
      >
        <SheetTitle className="sr-only">
          {creator ? `${creator.fullName} Profile` : "Creator Profile"}
        </SheetTitle>
        <div className="flex h-[calc(100vh-1rem)] flex-col">
          <SheetHeader className="shrink-0 flex flex-row items-center border-b border-border px-6 py-4">
            <div className="flex items-center gap-1">
              {hasPrev && (
                <Button variant="ghost" size="icon" onClick={onPrev} aria-label="Previous creator">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              )}
              {hasNext && (
                <Button variant="ghost" size="icon" onClick={onNext} aria-label="Next creator">
                  <ChevronRight className="h-5 w-5" />
                </Button>
              )}
            </div>

            {creator && (
              <div className="flex sm:hidden flex-1 items-center gap-3 min-w-0">
                {creator.profilePhotoUrl && (
                  <div className="relative h-10 w-10 rounded-full overflow-hidden shrink-0 bg-muted">
                    <Image
                      src={creator.profilePhotoUrl}
                      alt={creator.fullName}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                )}
                <span className="text-lg font-semibold truncate">{creator.fullName}</span>
              </div>
            )}

            <div className="flex items-center gap-1 ml-auto">
              {creator && (
                <Button
                  variant="outline"
                  size="icon"
                  className="sm:hidden"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Creator details"
                >
                  <Info className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Close creator profile"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </SheetHeader>

          {creator && (
            <div className="flex flex-1 min-h-0">
              <CreatorSidebar
                creator={creator}
                sheetOpen={sidebarOpen}
                onSheetOpenChange={setSidebarOpen}
              />
              <CreatorContent creator={creator} />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
