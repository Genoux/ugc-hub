"use client";

import { MoreHorizontal, PanelLeft, X } from "lucide-react";
import { useState } from "react";
import type { CreatorProfile } from "@/features/creators/actions/admin/get-creator-profile";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/shared/components/ui/sheet";
import { cn } from "@/shared/lib/utils";
import { BlacklistCreatorDialog } from "./_components/blacklist-creator-dialog";
import { UnblacklistCreatorDialog } from "./_components/unblacklist-creator-dialog";
import { CreatorContent } from "./creator-content";
import { CreatorSidebar } from "./creator-sidebar";

interface CreatorOverlayProps {
  creator: CreatorProfile | null;
  onClose: () => void;
}

export function CreatorOverlay({ creator, onClose }: CreatorOverlayProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [blacklistDialogOpen, setBlacklistDialogOpen] = useState(false);
  const [unblacklistDialogOpen, setUnblacklistDialogOpen] = useState(false);
  const [blacklistReason, setBlacklistReason] = useState("");

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
        <div className="flex h-[calc(100vh-4rem)] flex-col">
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
              <div className="flex justify-end items-center ml-auto w-full gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Creator actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {creator?.status === "blacklisted" ? (
                      <DropdownMenuItem onClick={() => setUnblacklistDialogOpen(true)}>
                        Remove from blacklist
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => setBlacklistDialogOpen(true)}>
                        Blacklist
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  aria-label="Close creator profile"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
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
                className={cn(
                  "relative flex flex-1 min-w-0 min-h-0 transition-[filter] duration-200",
                  sidebarOpen && "blur-sm overflow-hidden sm:filter-none",
                )}
              >
                {sidebarOpen && (
                  <button
                    type="button"
                    aria-label="Close creator info"
                    className="absolute inset-0 z-10 sm:hidden"
                    onClick={() => setSidebarOpen(false)}
                  />
                )}
                <CreatorContent creator={creator} contentInert={sidebarOpen} />
              </div>
            </div>
          )}
        </div>
      </SheetContent>
      {creator && (
        <>
          <BlacklistCreatorDialog
            open={blacklistDialogOpen}
            onOpenChange={setBlacklistDialogOpen}
            creatorId={creator.id}
            creatorName={creator.fullName}
            reason={blacklistReason}
            onReasonChange={setBlacklistReason}
          />
          <UnblacklistCreatorDialog
            open={unblacklistDialogOpen}
            onOpenChange={setUnblacklistDialogOpen}
            creatorId={creator.id}
            creatorName={creator.fullName}
            blacklistReason={creator.status === "blacklisted" ? creator.blacklistReason : null}
          />
        </>
      )}
    </Sheet>
  );
}
