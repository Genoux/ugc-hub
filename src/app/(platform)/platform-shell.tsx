"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AnimatePresence } from "motion/react";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import { PlatformDisclaimer } from "@/shared/components/blocks/platform-disclaimer";
import { AppSidebar } from "@/shared/components/layout/app-sidebar";
import { LoadingScreen } from "@/shared/components/layout/loading-screen";
import { SiteHeader } from "@/shared/components/layout/site-header";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";
import { makeQueryClient } from "@/shared/lib/query-client";

export function PlatformShell({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient());
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    setIsAppReady(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
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
            <div className="flex min-h-0 flex-1 flex-col">{children}</div>
          </SidebarInset>
        </SidebarProvider>
        <PlatformDisclaimer />
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
