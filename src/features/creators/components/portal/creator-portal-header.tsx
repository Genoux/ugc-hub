"use client";

import { UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { useCreatorPortal } from "./creator-portal-context";

export function CreatorPortalHeader() {
  const { resolvedTheme } = useTheme();
  const clerkAppearance = resolvedTheme === "dark" ? { baseTheme: dark } : undefined;
  const { activeTab, setActiveTab, showNav } = useCreatorPortal();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between px-6 gap-2">
      <Image src="/inBeat.svg" alt="inBeat" width={32} height={32} />
      <div className="flex items-center gap-1">
        {showNav && (
          <>
            <Button
              className={cn(activeTab === "profile" && "bg-secondary text-secondary-foreground")}
              variant="ghost"
              onClick={() => setActiveTab("profile")}
            >
              My Profile
            </Button>
            <Button
              className={cn(activeTab === "content" && "bg-secondary text-secondary-foreground")}
              variant="ghost"
              type="button"
              onClick={() => setActiveTab("content")}
            >
              Collaborations
            </Button>
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        <UserButton
          appearance={clerkAppearance}
          userProfileProps={{ appearance: clerkAppearance }}
        />
      </div>
    </header>
  );
}
