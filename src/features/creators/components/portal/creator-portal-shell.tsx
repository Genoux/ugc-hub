"use client";

import { AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { CreatorProfile } from "@/features/creators/actions/portal/get-creator-profile";
import type { CreatorSubmissions } from "@/features/creators/actions/portal/get-creator-submissions";
import { useCreatorPortal } from "./creator-portal-context";
import { OnboardingShell } from "./onboarding/onboarding-shell";
import { CollaborationTab } from "./tabs/collaborations/collaboration-tab";
import { CreatorProfileTab } from "./tabs/profile/profile-tab";

export type CreatorUIState = "pending_approval" | "pending_profile" | "live" | "declined";

interface CreatorPortalShellProps {
  creator: CreatorProfile;
  uiState: CreatorUIState;
  content: CreatorSubmissions;
}

export function CreatorPortalShell({ creator, uiState, content }: CreatorPortalShellProps) {
  const router = useRouter();
  const [onboardingOpen, setOnboardingOpen] = useState(uiState === "pending_profile");
  const { activeTab, setShowNav } = useCreatorPortal();

  useEffect(() => {
    setShowNav(creator.profileCompleted);
    return () => setShowNav(false);
  }, [creator.profileCompleted, setShowNav]);

  const handleOnboardingClose = () => {
    setOnboardingOpen(false);
    router.refresh();
  };

  return (
    <div className="flex min-h-full flex-col pb-40 pt-6 px-6">
      <div className="mx-auto w-full max-w-5xl flex flex-col min-h-full">
        {activeTab === "profile" && (
          <CreatorProfileTab
            creator={creator}
            uiState={uiState}
            onOpenOnboarding={() => setOnboardingOpen(true)}
          />
        )}
        {activeTab === "content" && <CollaborationTab content={content} />}
      </div>

      <AnimatePresence>
        {onboardingOpen && (
          <OnboardingShell
            creator={creator}
            onComplete={handleOnboardingClose}
            onClose={handleOnboardingClose}
          />
        )}
      </AnimatePresence>
      <div
        className="z-0 pointer-events-none absolute inset-x-0 bottom-0 h-16 backdrop-blur-lg mask-[linear-gradient(to_top,black,transparent)]"
        aria-hidden
      />
    </div>
  );
}
