"use client";

import { AnimatePresence } from "motion/react";
import { useState } from "react";
import type { CreatorProfile } from "@/features/creators/actions/portal/get-creator-profile";
import type { CreatorSubmissions } from "@/features/creators/actions/portal/get-creator-submissions";
import { resetCreatorProfile } from "@/features/creators/actions/portal/reset-creator-profile";
import type { CreatorUIState } from "@/features/creators/lib/get-creator-ui-state";
import { DevToolbar } from "@/shared/components/tools/dev-toolbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { OnboardingShell } from "./onboarding";
import { ProfileStateBanner } from "./profile-state-banner";
import { CreatorContentTab } from "./tabs/creator-content-tab";
import { CreatorProfileTab } from "./tabs/creator-profile-tab";

interface CreatorPortalShellProps {
  creator: CreatorProfile;
  uiState: CreatorUIState;
  content: CreatorSubmissions;
}

export function CreatorPortalShell({ creator, uiState, content }: CreatorPortalShellProps) {
  const [onboardingOpen, setOnboardingOpen] = useState(uiState === "pending_profile");

  return (
    <div className="flex h-full flex-col overflow-y-auto p-6">
      <div className="mx-auto w-full max-w-7xl space-y-4">
        <ProfileStateBanner
          uiState={uiState}
          onOpenOnboarding={
            uiState === "pending_profile" ? () => setOnboardingOpen(true) : undefined
          }
        />

        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">My Profile</TabsTrigger>
            <TabsTrigger value="content">Submitted Content</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" forceMount className="data-[state=inactive]:hidden">
            <CreatorProfileTab creator={creator} />
          </TabsContent>

          <TabsContent value="content" forceMount className="data-[state=inactive]:hidden">
            <CreatorContentTab content={content} />
          </TabsContent>
        </Tabs>
      </div>

      <AnimatePresence>
        {onboardingOpen && (
          <OnboardingShell
            creator={creator}
            onComplete={() => window.location.reload()}
            onClose={() => setOnboardingOpen(false)}
          />
        )}
      </AnimatePresence>

      {!onboardingOpen && (
        <DevToolbar
          context="Creator Portal"
          tools={[
            {
              label: "Reset onboarding",
              action: async () => {
                await resetCreatorProfile(creator.id);
                window.location.reload();
              },
            },
            {
              label: "Open onboarding",
              action: () => setOnboardingOpen(true),
            },
          ]}
        />
      )}
    </div>
  );
}
