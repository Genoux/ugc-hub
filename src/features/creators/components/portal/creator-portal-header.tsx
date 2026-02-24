"use client";

import { UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

export function CreatorPortalHeader() {
  const { resolvedTheme } = useTheme();
  const clerkAppearance = resolvedTheme === "dark" ? { baseTheme: dark } : undefined;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between px-6">
      <span className="text-sm font-semibold tracking-tight">pool</span>
      <div className="flex items-center gap-2">
        <UserButton
          appearance={clerkAppearance}
          userProfileProps={{ appearance: clerkAppearance }}
        />
      </div>
    </header>
  );
}
