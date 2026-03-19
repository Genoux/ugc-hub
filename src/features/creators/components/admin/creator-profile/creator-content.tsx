"use client";

import { useQueryClient } from "@tanstack/react-query";
import { FolderIcon, Plus } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useState } from "react";
import { CollaborationWizard } from "@/features/collaborations/components/collaboration-wizard";
import type { CollaborationRatingsInput } from "@/features/collaborations/schemas";
import type { LogCollabInitialData } from "@/features/collaborations/types";
import type { CreatorProfile } from "@/features/creators/actions/admin/get-creator-profile";
import { AssetCard } from "@/shared/components/blocks/asset-card";
import { DownloadButton } from "@/shared/components/blocks/download-button";
import { Button } from "@/shared/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";
import { NumberDot } from "@/shared/components/ui/number-dot";
import { platformQueryKeys } from "@/shared/lib/platform-query-keys";

import { BlacklistedBanner } from "./_components/blacklisted-banner";
import { CollaborationCard } from "./_components/collaboration-card";

type ClosedCollab = CreatorProfile["closedCollaborations"][number];

function collabToInitialData(collab: ClosedCollab): LogCollabInitialData {
  if (
    !collab.ratingVisualQuality ||
    !collab.ratingActingDelivery ||
    !collab.ratingReliabilitySpeed
  ) {
    throw new Error("Cannot edit a collaboration that is missing ratings");
  }
  return {
    collaborationId: collab.id,
    name: collab.projectName,
    projectId: collab.projectId,
    ratings: {
      visual_quality: collab.ratingVisualQuality as CollaborationRatingsInput["visual_quality"],
      acting_line_delivery:
        collab.ratingActingDelivery as CollaborationRatingsInput["acting_line_delivery"],
      reliability_speed:
        collab.ratingReliabilitySpeed as CollaborationRatingsInput["reliability_speed"],
    },
    piecesOfContent: Math.max(1, collab.piecesOfContent ?? 1),
    totalPaidDollars: (collab.totalPaidCents ?? 0) / 100,
    notes: collab.reviewNotes,
    highlights: collab.highlights,
  };
}

function closedRatingsExcluding(collabs: ClosedCollab[], excludeId?: string) {
  return collabs
    .filter((c) => !excludeId || c.id !== excludeId)
    .map((c) => ({
      ratingVisualQuality: c.ratingVisualQuality,
      ratingActingDelivery: c.ratingActingDelivery,
      ratingReliabilitySpeed: c.ratingReliabilitySpeed,
    }));
}

interface CreatorContentProps {
  creator: CreatorProfile;
}

type WizardState = { mode: "log" } | { mode: "edit"; collab: ClosedCollab };

export function CreatorContent({ creator }: CreatorContentProps) {
  const queryClient = useQueryClient();
  const [wizardState, setWizardState] = useState<WizardState | null>(null);

  const allAssets = [
    ...creator.portfolioVideos.map((asset) => ({
      id: asset.id,
      url: asset.url,
      filename: asset.filename,
    })),
    ...creator.closedCollaborations
      .flatMap((collab) => collab.highlights)
      .map((highlight) => ({
        id: highlight.id,
        url: highlight.url,
        filename: highlight.filename,
      })),
  ];

  const isBlacklisted = creator.status === "blacklisted";

  return (
    <div className="flex-1 min-w-0 flex flex-col overflow-y-auto p-4 pb-8">
      {isBlacklisted && (
        <BlacklistedBanner
          reason={creator.blacklistReason}
          blacklistedBy={creator.blacklistedByProfile}
        />
      )}
      <div className="flex flex-col flex-1 gap-8">
        {allAssets.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-base font-semibold flex items-center gap-1">
              Portfolio <NumberDot count={allAssets.length} />
            </h2>
            <div className="flex overflow-x-auto gap-1">
              {allAssets.map((asset) => (
                <AssetCard
                  key={asset.id}
                  size="sm"
                  src={asset.url}
                  filename={asset.filename}
                  actionSlot={
                    <DownloadButton
                      assets={[{ id: asset.id, filename: asset.filename, url: asset.url }]}
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-white! hover:bg-white/20"
                      stopPropagation
                    />
                  }
                />
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-col flex-1 gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold flex items-center gap-1">
              Collaborations
              <NumberDot count={creator.closedCollaborations.length} />
            </h2>
            {!isBlacklisted && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="shrink-0"
                onClick={() => setWizardState({ mode: "log" })}
              >
                <Plus className="mr-1 size-4" />
                Log collaboration
              </Button>
            )}
          </div>
          {creator.closedCollaborations.length > 0 ? (
            <div className="space-y-2">
              {creator.closedCollaborations.map((collab) => (
                <CollaborationCard
                  key={collab.id}
                  collab={collab}
                  onEdit={(c) => setWizardState({ mode: "edit", collab: c })}
                />
              ))}
            </div>
          ) : (
            <Empty className="flex-1 w-full border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FolderIcon size={16} />
                </EmptyMedia>
                <EmptyTitle>No collaborations</EmptyTitle>
                <EmptyDescription>
                  This creator has not logged any collaborations yet.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </div>
      </div>

      <AnimatePresence>
        {wizardState && (
          <CollaborationWizard
            mode="log"
            key={wizardState.mode === "edit" ? wizardState.collab.id : "log-new"}
            initialData={
              wizardState.mode === "edit" ? collabToInitialData(wizardState.collab) : undefined
            }
            onClose={() => setWizardState(null)}
            onSuccess={() => {
              void queryClient.invalidateQueries({
                queryKey: platformQueryKeys.creatorProfile(creator.id),
              });
            }}
            creatorId={creator.id}
            creatorName={creator.fullName}
            profilePhotoUrl={creator.profilePhotoUrl}
            closedCollabRatings={closedRatingsExcluding(
              creator.closedCollaborations,
              wizardState.mode === "edit" ? wizardState.collab.id : undefined,
            )}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
