import type { CreatorProfile } from "@/features/creators/actions/admin/get-creator-profile";
import { AssetCarousel } from "./_components/asset-carousel";
import { SectionHeader } from "./_components/section-header";
import { CollaborationCard } from "./collaboration-card";

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
        <AssetCarousel
          assets={creator.portfolioVideos}
          emptyLabel="No past work uploaded yet."
          downloadButtonClassName="h-8 w-8 text-white! hover:bg-white/20"
        />
      </div>

      <div className="space-y-3">
        <SectionHeader title="Fieldtrip portfolio" count={allHighlights.length} />
        <AssetCarousel
          assets={allHighlights}
          emptyLabel="No highlights yet."
          downloadButtonClassName="h-8 w-8 text-white! hover:bg-white/20"
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
