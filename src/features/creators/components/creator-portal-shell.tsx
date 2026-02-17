"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import type { CreatorUIState } from "../lib/get-creator-ui-state";
import type { Creator } from "../types";
import { ProfileStateBanner } from "./profile-state-banner";
import { ProfileWizard } from "./wizard";

interface CreatorPortalShellProps {
  creator: Creator;
  uiState: CreatorUIState;
}

export function CreatorPortalShell({ creator, uiState }: CreatorPortalShellProps) {
  const [wizardOpen, setWizardOpen] = useState(
    uiState === "onboarding" || uiState === "direct_invite_pending",
  );

  const handleWizardComplete = () => {
    // Re-fetch server state after wizard completes
    window.location.reload();
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto p-6">
      <div className="mx-auto w-full max-w-3xl space-y-4">
        <ProfileStateBanner
          uiState={uiState}
          onOpenWizard={
            uiState === "onboarding" ||
            uiState === "direct_invite_pending" ||
            uiState === "approved_incomplete"
              ? () => setWizardOpen(true)
              : undefined
          }
        />

        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">My Profile</TabsTrigger>
            <TabsTrigger value="content">Submitted Content</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Profile</CardTitle>
                <CardDescription>
                  {creator.profileCompleted
                    ? "Your creator profile."
                    : "Your creator profile will appear here once it's set up."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {creator.profileCompleted && (
                  <div className="space-y-3 text-sm">
                    {creator.fullName && (
                      <div>
                        <p className="text-muted-foreground">Name</p>
                        <p className="font-medium">{creator.fullName}</p>
                      </div>
                    )}
                    {creator.country && (
                      <div>
                        <p className="text-muted-foreground">Country</p>
                        <p className="font-medium">{creator.country}</p>
                      </div>
                    )}
                    {creator.socialChannels && (
                      <div>
                        <p className="text-muted-foreground">Socials</p>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {creator.socialChannels.instagram_handle && (
                            <span className="bg-muted rounded px-2 py-0.5 text-xs">
                              @{creator.socialChannels.instagram_handle} · Instagram
                            </span>
                          )}
                          {creator.socialChannels.tiktok_handle && (
                            <span className="bg-muted rounded px-2 py-0.5 text-xs">
                              @{creator.socialChannels.tiktok_handle} · TikTok
                            </span>
                          )}
                          {creator.socialChannels.youtube_handle && (
                            <span className="bg-muted rounded px-2 py-0.5 text-xs">
                              @{creator.socialChannels.youtube_handle} · YouTube
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    {creator.ugcCategories && creator.ugcCategories.length > 0 && (
                      <div>
                        <p className="text-muted-foreground">Categories</p>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {creator.ugcCategories.map((c) => (
                            <span key={c} className="bg-muted rounded px-2 py-0.5 text-xs">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {creator.rateRangeSelf && (
                      <div>
                        <p className="text-muted-foreground">Rate range</p>
                        <p className="font-medium">
                          ${creator.rateRangeSelf.min} – ${creator.rateRangeSelf.max} per video
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Content Submissions</CardTitle>
                <CardDescription>
                  Projects you've submitted content for will appear here.
                </CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {wizardOpen && (
        <ProfileWizard
          creator={creator}
          onComplete={handleWizardComplete}
          onClose={() => setWizardOpen(false)}
        />
      )}
    </div>
  );
}
