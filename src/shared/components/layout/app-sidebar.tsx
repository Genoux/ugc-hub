"use client";

import { Folder, UserPlus, Users } from "lucide-react";
import Image from "next/image";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

const navItems = [
  {
    title: "Applicants",
    url: "/applicants",
    icon: UserPlus,
    disabled: false,
  },
  {
    title: "Database",
    url: "/database",
    icon: Users,
    disabled: false,
  },
  {
    title: "Projects",
    url: "/projects",
    icon: Folder,
    disabled: true,
    span: "(Coming soon)",
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="data-[slot=sidebar-menu-button]:p-1.5! flex items-center justify-between">
              <Image src="/inBeat.svg" alt="inBeat" width={32} height={32} />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
        {(process.env.NODE_ENV === "development" ||
          process.env.VERCEL_ENV === "development" ||
          process.env.VERCEL_ENV === "preview") && (
          <div className="flex items-center justify-center w-full">
            <div className="w-full flex items-center justify-center gap-1 bg-orange-300/20 rounded-full py-1 w-fit pl-2 pr-3">
              <span className="animate-pulse duration-200 h-3 w-3 bg-orange-400/20 rounded-full flex items-center justify-center">
                <span className="h-1.5 w-1.5 bg-orange-500 rounded-full"></span>
              </span>
              <span className="text-xs text-muted-foreground text-orange-500">
                Development mode
              </span>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
