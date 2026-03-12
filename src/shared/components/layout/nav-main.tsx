"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    disabled?: boolean;
    span?: string;
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url || pathname.startsWith(`${item.url}/`);
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  className={item.disabled ? "opacity-50" : ""}
                  tooltip={item.disabled ? item.title : undefined}
                  asChild
                  isActive={isActive}
                >
                  <Link
                    href={item.disabled ? "#" : item.url}
                    onClick={item.disabled ? (e) => e.preventDefault() : undefined}
                    aria-disabled={item.disabled}
                    className="flex items-center"
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    {item.span && <span className="text-xs">{item.span}</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
