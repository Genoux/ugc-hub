import type { CreatorProfile } from "@/features/creators/actions/admin/get-creator-profile";
import { AssetCarousel } from "./_components/asset-carousel";
import { SectionHeader } from "./_components/section-header";
import { CollaborationCard } from "./collaboration-card";
import { Download } from "lucide-react";
import { AssetCard } from "@/shared/components/blocks/asset-card";
import { toast } from "sonner";
import { downloadAssets } from "@/features/projects/lib/download-assets";

interface CreatorContentProps {
  creator: CreatorProfile;
}

export function CreatorContent({ creator }: CreatorContentProps) {
  const closedCollabs = creator.closedCollaborations ?? [];
  const allHighlights = closedCollabs.flatMap((c) => c.highlights);

  return (
    <div className="flex-1 min-w-0 p-6 overflow-y-auto pb-8 space-y-8">
      <div className="space-y-3">
        <SectionHeader title="Portfolio" count={creator.portfolioVideos.length} />
        <div className="flex overflow-x-auto gap-2">
          {creator.portfolioVideos.map((asset) => (
            <AssetCard
              size="md"
              key={asset.id}
              src={asset.url}
              filename={asset.filename}
              action={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                await downloadAssets(
                  [{ id: asset.id, filename: asset.filename, url: asset.url }],
                  { onError: () => toast.error("Download failed") },
                );
              }}
              buttonIcon={<Download className="h-4 w-4" />}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <SectionHeader title="Fieldtrip portfolio" count={allHighlights.length} />
        <AssetCarousel
          assets={allHighlights}
          emptyLabel="No highlights yet."
        />
      </div>

      <div>
        <SectionHeader
          title="Collaborations"
          count={closedCollabs.length > 0 ? closedCollabs.length : undefined}
          className="pb-3"
        />
        {closedCollabs.length > 0 ? (
          <div className="space-y-2">
            {closedCollabs.map((collab) => (
              <CollaborationCard key={collab.id} collab={collab} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6">
            No collaborations logged yet.
          </p>
        )}
      </div>
    </div>
  );
}
