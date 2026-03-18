"use client";

import { ArrowLeft, MoreHorizontal, PanelLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CreatorProfile as CreatorProfileData } from "@/features/creators/actions/admin/get-creator-profile";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { cn } from "@/shared/lib/utils";
import { BlacklistCreatorDialog } from "./_components/blacklist-creator-dialog";
import { UnblacklistCreatorDialog } from "./_components/unblacklist-creator-dialog";
import { CreatorContent } from "./creator-content";
import { CreatorSidebar } from "./creator-sidebar";

interface CreatorProfileProps {
  creator: CreatorProfileData;
}

export function CreatorProfile({ creator }: CreatorProfileProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [blacklistDialogOpen, setBlacklistDialogOpen] = useState(false);
  const [unblacklistDialogOpen, setUnblacklistDialogOpen] = useState(false);
  const [blacklistReason, setBlacklistReason] = useState("");

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <header className="bg-background flex shrink-0 flex-row items-center gap-1 border-b border-border px-6 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          aria-label="Back to database"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Button
          variant={sidebarOpen ? "secondary" : "ghost"}
          size="icon"
          className="sm:hidden"
          onClick={() => setSidebarOpen((o) => !o)}
          aria-label="Toggle creator info"
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
        <div className="ml-auto flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Creator actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {creator.status === "blacklisted" ? (
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
        </div>
      </header>

      <div className="relative flex flex-1 min-h-0">
        <CreatorSidebar
          creator={creator}
          sidebarOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div
          className={cn(
            "relative flex flex-1 min-w-0 min-h-0 transition-[filter] duration-200",
            sidebarOpen && "blur-xs overflow-hidden sm:filter-none",
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
          <CreatorContent creator={creator} />
        </div>
      </div>

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
    </div>
  );
}
