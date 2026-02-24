"use client";

import { AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { LoadingScreen } from "@/shared/components/loading-screen";
import { Separator } from "@/shared/components/ui/separator";
import { CreatorPortalHeader } from "./creator-portal-header";

export function CreatorPortalLayout({ children }: { children: React.ReactNode }) {
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    setIsAppReady(true);
  }, []);

  return (
    <div className="flex h-screen flex-col bg-background">
      <AnimatePresence mode="wait">
        {!isAppReady && <LoadingScreen key="loading" />}
      </AnimatePresence>
      <CreatorPortalHeader />
      <Separator />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
