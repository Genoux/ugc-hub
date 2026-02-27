"use client";

import { createContext, useContext, useState } from "react";

type ActiveTab = "profile" | "content";

interface CreatorPortalContextValue {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  showNav: boolean;
  setShowNav: (show: boolean) => void;
}

const CreatorPortalContext = createContext<CreatorPortalContextValue | null>(null);

export function CreatorPortalProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("profile");
  const [showNav, setShowNav] = useState(false);

  return (
    <CreatorPortalContext.Provider value={{ activeTab, setActiveTab, showNav, setShowNav }}>
      {children}
    </CreatorPortalContext.Provider>
  );
}

export function useCreatorPortal() {
  const ctx = useContext(CreatorPortalContext);
  if (!ctx) throw new Error("useCreatorPortal must be used within CreatorPortalProvider");
  return ctx;
}
