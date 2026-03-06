"use client";

import { Loader2, X } from "lucide-react";
import { useState } from "react";
import type { CreatorProfile } from "@/features/creators/actions/admin/get-creator-profile";
import { getCreatorProfile } from "@/features/creators/actions/admin/get-creator-profile";
import { CreatorProfileInfo } from "@/features/creators/components/admin/creator-profile-info";
import { Button } from "@/shared/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle } from "@/shared/components/ui/sheet";

interface CreatorProfileSheetProps {
  creatorId: string;
  creatorName: string;
  children: React.ReactNode;
}

export function CreatorProfileSheet({
  creatorId,
  creatorName,
  children,
}: CreatorProfileSheetProps) {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<CreatorProfile | null>(null);

  async function handleOpen() {
    setOpen(true);
    if (!profile) {
      const data = await getCreatorProfile(creatorId);
      setProfile(data);
    }
  }

  return (
    <>
      <button type="button" onClick={handleOpen} className="cursor-pointer text-left">
        {children}
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="overflow-y-auto p-0 gap-0 flex flex-col"
        >
          <SheetTitle className="sr-only">{creatorName} Profile</SheetTitle>
          {profile ? (
            <>
              <div className="flex justify-end px-2 pt-2 shrink-0">
                <SheetClose asChild>
                  <Button variant="ghost" size="icon-sm">
                    <X />
                  </Button>
                </SheetClose>
              </div>
              <CreatorProfileInfo creator={profile} />
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
