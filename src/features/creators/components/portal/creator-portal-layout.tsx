"use client";

import { AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { LoadingScreen } from "@/shared/components/layout/loading-screen";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { CreatorPortalProvider } from "./creator-portal-context";
import { CreatorPortalHeader } from "./creator-portal-header";

function handleContactUs() {
  window.location.href = "mailto:paola@inbeat.agency?subject=Help%20with%20UGC%20Hub";
}
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
          <div className="fixed bottom-6 right-6">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => handleContactUs()}
                  variant="outline"
                  size="icon"
                  className="w-8 h-8"
                >
                  <span className="text-md font-bold text-muted-foreground">?</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Contact us</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CreatorPortalProvider>
    </TooltipProvider>
  );
}
