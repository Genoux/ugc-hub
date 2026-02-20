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
import type { CreatorSubmissions } from "../actions/get-creator-submissions";
import type { CreatorUIState } from "../lib/get-creator-ui-state";
import type { Creator } from "../types";
import { CreatorContentTab } from "./creator-content-tab";
import { ProfileStateBanner } from "./profile-state-banner";
import { ProfileWizard } from "./wizard";

interface CreatorPortalShellProps {
  creator: Creator;
  uiState: CreatorUIState;
  content: CreatorSubmissions;
}

export function CreatorPortalShell({ creator, uiState, content }: CreatorPortalShellProps) {
  const [wizardOpen, setWizardOpen] = useState(uiState === "pending_profile");

  const handleWizardComplete = () => {
    // Re-fetch server state after wizard completes
    window.location.reload();
  };

  // Pre-fill steps 1-2 from existing DB record (set when creator applied via form)
  const initialData = {
    fullName: creator.fullName ?? "",
    country: creator.country ?? "",
    languages: Array.isArray(creator.languages)
      ? (creator.languages as Array<{ language: string }>).map((l) => l.language)
      : [],
    instagramHandle:
      (creator.socialChannels as { instagram_handle?: string } | null)?.instagram_handle ?? "",
    tiktokHandle:
      (creator.socialChannels as { tiktok_handle?: string } | null)?.tiktok_handle ?? "",
    youtubeHandle:
      (creator.socialChannels as { youtube_handle?: string } | null)?.youtube_handle ?? "",
    portfolioUrl: creator.portfolioUrl ?? "",
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto p-6">
      <div className="mx-auto w-full max-w-3xl space-y-4">
        <ProfileStateBanner
          uiState={uiState}
          onOpenWizard={uiState === "pending_profile" ? () => setWizardOpen(true) : undefined}
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
                <CardDescription>Assets you've submitted across all projects.</CardDescription>
              </CardHeader>
              <CardContent>
                <CreatorContentTab content={content} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {wizardOpen && (
        <ProfileWizard
          creator={creator}
          initialData={initialData}
          onComplete={handleWizardComplete}
          onClose={() => setWizardOpen(false)}
        />
      )}
    </div>
  );
}
