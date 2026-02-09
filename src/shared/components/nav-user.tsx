"use client";

import { UserButton, UserProfile } from "@clerk/nextjs";
import { useRef } from "react";

import { SidebarMenu, SidebarMenuItem } from "@/shared/components/ui/sidebar";

export function NavUser() {
  const triggerRef = useRef<HTMLDivElement>(null);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {/* biome-ignore lint/a11y/useSemanticElements: cannot use <button> — would nest Clerk UserButton’s own button */}
        <div
          role="button"
          tabIndex={0}
          className="flex cursor-pointer items-center gap-2 rounded-md pl-4 pr-2 py-1.5 outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent focus-visible:ring-2 [&:has(button:focus-visible)]:ring-2"
          onClick={(e) => {
            const button = triggerRef.current?.querySelector("button");
            if (button && !button.contains(e.target as Node)) {
              button.click();
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              triggerRef.current?.querySelector("button")?.click();
            }
          }}
        >
          <div ref={triggerRef}>
            <UserButton />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">Account</span>
            <span className="text-muted-foreground truncate text-xs">Manage settings</span>
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
