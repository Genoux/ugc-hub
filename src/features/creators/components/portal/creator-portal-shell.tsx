"use client";

import { Bug } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CreatorProfile } from "@/features/creators/actions/portal/get-creator-profile";
import type { CreatorSubmissions } from "@/features/creators/actions/portal/get-creator-submissions";
import { resetCreatorProfile } from "@/features/creators/actions/portal/reset-creator-profile";
import type { CreatorUIState } from "@/features/creators/lib/get-creator-ui-state";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { EASING_FUNCTION } from "@/shared/lib/constant";
import { OnboardingShell } from "./onboarding";
import { ProfileStateBanner } from "./profile-state-banner";
import { CreatorContentTab } from "./tabs/content/creator-content-tab";
import { CreatorProfileTab } from "./tabs/profile/creator-profile-tab";

const UI_STATES: CreatorUIState[] = ["pending_approval", "pending_profile", "live", "declined"];

interface CreatorPortalShellProps {
  creator: CreatorProfile;
  uiState: CreatorUIState;
  content: CreatorSubmissions;
}

export function CreatorPortalShell({ creator, uiState, content }: CreatorPortalShellProps) {
  const router = useRouter();
  const [onboardingOpen, setOnboardingOpen] = useState(uiState === "pending_profile");
  const [activeTab, setActiveTab] = useState<"profile" | "content">("profile");
  const [debugUiState, setDebugUiState] = useState<CreatorUIState | null>(null);

  const effectiveUiState = debugUiState ?? uiState;

  const handleOnboardingClose = () => {
    setOnboardingOpen(false);
    router.refresh();
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto pt-12 pb-40">
      <div className="mx-auto w-full max-w-5xl flex flex-col flex-1 min-h-0">
        {/* <ProfileStateBanner
          uiState={effectiveUiState}
          onOpenOnboarding={() => setOnboardingOpen(true)}
        /> */}
        <Button
          className="absolute top-0 right-0"
          variant="outline"
          size="sm"
          onClick={() => resetCreatorProfile(creator.id)}
        >
          reset
        </Button>
        <Tabs defaultValue="profile" className="flex flex-col gap-6 flex-1 min-h-0">
          <div className="flex items-center justify-between w-full">
            {creator.profileCompleted && (
              <TabsList variant="line">
                <TabsTrigger onClick={() => setActiveTab("profile")} value="profile">
                  My Profile
                </TabsTrigger>
                <TabsTrigger onClick={() => setActiveTab("content")} value="content">
                  Submitted Content
                </TabsTrigger>
              </TabsList>
            )}
            {creator.profileCompleted && (
              <AnimatePresence mode="wait">
                {activeTab === "profile" ? (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.1, ease: EASING_FUNCTION.exponential }}
                  >
                    <Button variant="outline" size="sm" onClick={() => setOnboardingOpen(true)}>
                      Edit profile
                    </Button>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            )}
          </div>
          <TabsContent
            value="profile"
            forceMount
            className="data-[state=inactive]:hidden flex-1 flex flex-col min-h-0"
          >
            <CreatorProfileTab
              creator={creator}
              uiState={effectiveUiState}
              onOpenOnboarding={() => setOnboardingOpen(true)}
            />
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
            onComplete={handleOnboardingClose}
            onClose={handleOnboardingClose}
          />
        )}
      </AnimatePresence>
      <div
        className="z-0 pointer-events-none absolute inset-x-0 bottom-0 h-24 backdrop-blur-sm [mask-image:linear-gradient(to_top,black,transparent)]"
        aria-hidden
      />

      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-1 rounded-lg border border-border bg-background/95 p-2 shadow-lg backdrop-blur">
          <span className="flex items-center gap-1.5 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            <Bug className="size-2.5" />
            State
          </span>
          {UI_STATES.map((state) => (
            <Button
              key={state}
              type="button"
              variant={effectiveUiState === state ? "secondary" : "ghost"}
              size="sm"
              className="h-7 justify-start text-xs font-normal"
              onClick={() => setDebugUiState(state)}
            >
              {state.replace("_", " ")}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
