"use client";

import { FolderIcon } from "lucide-react";
import type { CreatorProfile } from "@/features/creators/actions/admin/get-creator-profile";
import { AssetCard } from "@/shared/components/blocks/asset-card";
import { DownloadButton } from "@/shared/components/blocks/download-button";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";
import { NumberDot } from "@/shared/components/ui/number-dot";

import { BlacklistedBanner } from "./_components/blacklisted-banner";
import { CollaborationCard } from "./_components/collaboration-card";

interface CreatorContentProps {
  creator: CreatorProfile;
  contentInert?: boolean;
}

export function CreatorContent({ creator, contentInert = false }: CreatorContentProps) {
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
    <div
      className={`flex-1 min-w-0 flex flex-col overflow-y-auto p-4 sm:p-4 ${contentInert ? "pointer-events-none" : ""}`}
    >
      <div className="flex items-start justify-between w-full gap-20">
        {isBlacklisted && (
          <BlacklistedBanner
            reason={creator.blacklistReason}
            blacklistedBy={creator.blacklistedByProfile}
          />
        )}
      </div>
      <div className="min-h-full flex flex-col gap-8 pb-6 sm:pb-8">
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
        <div className="flex flex-col flex-1 gap-3">
          <h2 className="text-base font-semibold flex items-center gap-1">
            Collaborations
            <NumberDot count={creator.closedCollaborations.length} />
          </h2>
          {creator.closedCollaborations.length > 0 ? (
            <div className="space-y-2">
              {creator.closedCollaborations.map((collab) => (
                <CollaborationCard key={collab.id} collab={collab} />
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
    </div>
  );
}
