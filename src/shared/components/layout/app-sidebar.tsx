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
            <SidebarMenuButton className="data-[slot=sidebar-menu-button]:p-1.5!">
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
      </SidebarFooter>
    </Sidebar>
  );
}
