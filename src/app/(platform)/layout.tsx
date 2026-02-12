"use client";

import { AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/shared/components/app-sidebar";
import { LoadingScreen } from "@/shared/components/loading-screen";
import { SiteHeader } from "@/shared/components/site-header";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    setIsAppReady(true);
  }, []);

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "220px",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AnimatePresence mode="wait">
        {!isAppReady && <LoadingScreen key="loading" />}
      </AnimatePresence>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-8">
          <div className="@container/main mx-auto w-full max-w-7xl flex flex-1 flex-col gap-2">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
