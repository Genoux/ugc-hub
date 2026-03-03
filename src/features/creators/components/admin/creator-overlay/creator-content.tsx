import type { CreatorProfile } from "@/features/creators/actions/admin/get-creator-profile";
import { SectionHeader } from "./_components/section-header";
import { CollaborationCard } from "./collaboration-card";
import { Download, FolderIcon } from "lucide-react";
import { AssetCard } from "@/shared/components/blocks/asset-card";
import { toast } from "sonner";
import { downloadAssets } from "@/features/projects/lib/download-assets";
import type { PortfolioVideo } from "@/features/creators/constants";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";

interface CreatorContentProps {
  creator: CreatorProfile;
}

async function handleDownloadAsset(e: React.MouseEvent<HTMLButtonElement>, asset: PortfolioVideo) {
  e.preventDefault();
  e.stopPropagation();
  await downloadAssets([{ id: asset.id, filename: asset.filename, url: asset.url }], {
    onError: () => toast.error("Download failed"),
  });
}

export function CreatorContent({ creator }: CreatorContentProps) {
  const allAssets = [
    ...creator.portfolioVideos.map((asset) => ({
      id: asset.id,
      url: asset.url,
      filename: asset.filename,
      onDownload: (e: React.MouseEvent<HTMLButtonElement>) => handleDownloadAsset(e, asset),
    })),
    ...creator.closedCollaborations
      .flatMap((collab) => collab.highlights)
      .map((highlight) => ({
        id: highlight.id,
        url: highlight.url,
        filename: highlight.filename,
        onDownload: (e: React.MouseEvent<HTMLButtonElement>) =>
          handleDownloadAsset(e, {
            id: highlight.id,
            filename: highlight.filename,
            url: highlight.url,
            sizeBytes: 0,
          } as PortfolioVideo),
      })),
  ];

  return (
    <div className="flex-1 min-w-0 p-4 sm:p-6 overflow-y-auto flex flex-col">
      <div className="flex flex-col gap-8 pb-40">
        <div className="space-y-3">
          <SectionHeader title="Showcase" count={allAssets.length} />
          <div className="flex overflow-x-auto gap-1">
            {allAssets.map((asset) => (
              <AssetCard
                key={asset.id}
                size="sm"
                src={asset.url}
                filename={asset.filename}
                action={asset.onDownload}
                buttonIcon={<Download className="h-4 w-4" />}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col flex-1 min-h-0">
          <SectionHeader
            title="Collaborations"
            count={
              creator.closedCollaborations.length > 0
                ? creator.closedCollaborations.length
                : undefined
            }
            className="pb-3"
          />
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
