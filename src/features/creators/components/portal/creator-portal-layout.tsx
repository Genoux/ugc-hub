"use client";

import { AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { LoadingScreen } from "@/shared/components/loading-screen";
import { Separator } from "@/shared/components/ui/separator";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { CreatorPortalProvider } from "./creator-portal-context";
import { CreatorPortalHeader } from "./creator-portal-header";

export function CreatorPortalLayout({ children }: { children: React.ReactNode }) {
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    setIsAppReady(true);
  }, []);

  return (
    <TooltipProvider>
      <CreatorPortalProvider>
        <div className="flex h-svh max-h-svh flex-col overflow-hidden bg-background min-h-0">
          <AnimatePresence mode="wait">
            {!isAppReady && <LoadingScreen key="loading" />}
          </AnimatePresence>
          <CreatorPortalHeader />
          <Separator />
          <main className="flex-1 min-h-0 overflow-y-auto">{children}</main>
        </div>
      </CreatorPortalProvider>
    </TooltipProvider>
  );
}
