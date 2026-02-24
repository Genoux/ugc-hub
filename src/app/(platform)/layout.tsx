"use client";

import { AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/shared/components/app-sidebar";
import { LoadingScreen } from "@/shared/components/loading-screen";
import { SiteHeader } from "@/shared/components/site-header";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";

const PLATFORM_ROUTES = ["/applicants", "/database", "/projects"] as const;

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const [isAppReady, setIsAppReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsAppReady(true);
  }, []);

  useEffect(() => {
    for (const route of PLATFORM_ROUTES) {
      router.prefetch(route);
    }
  }, [router]);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SidebarProvider
        className="h-svh overflow-hidden"
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
        <SidebarInset className="min-h-0 max-h-[calc(100svh-1rem)] overflow-hidden">
          <SiteHeader />
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  );
}
