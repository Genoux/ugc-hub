"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, PanelLeft, X } from "lucide-react";
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
          <SheetHeader className="bg-background gap-0.5 p-4 shrink-0 flex flex-row items-center border-b border-border px-4 py-2">
            <div className="flex items-center gap-1 justify-between w-full">
              {creator && (
                <Button
                  variant={sidebarOpen ? "secondary" : "ghost"}
                  size="icon"
                  className="sm:hidden"
                  onClick={() => setSidebarOpen((o) => !o)}
                  aria-label="Toggle creator info"
                >
                  <PanelLeft className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto"
                onClick={onClose}
                aria-label="Close creator profile"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </SheetHeader>

          {creator && (
            <div className="relative flex flex-1 min-h-0">
              <CreatorSidebar
                creator={creator}
                sidebarOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
              />
              <div
                className={`flex flex-1 min-w-0 min-h-0 transition-[filter] duration-200 ${sidebarOpen ? "sm:filter-none blur-sm overflow-hidden" : ""}`}
                onClick={() => sidebarOpen && setSidebarOpen(false)}
              >
                <CreatorContent creator={creator} contentInert={sidebarOpen} />
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
