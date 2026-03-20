"use client";

import { ChevronRight } from "lucide-react";
import type { CreatorSubmissions } from "@/features/creators/actions/portal/get-creator-submissions";
import { AssetThumbnail } from "@/shared/components/blocks/asset-card";
import { StatusBadge } from "@/shared/components/blocks/status-badge";

type Collaboration = CreatorSubmissions[number];
type Asset = Collaboration["submissions"][number]["assets"][number];

type PreviewAsset = Pick<Asset, "url" | "filename">;

function previewAssets(collaboration: Collaboration): PreviewAsset[] {
  const fromSubmissions: PreviewAsset[] = [];
  for (const sub of collaboration.submissions) {
    for (const asset of sub.assets) {
      if (asset.url) fromSubmissions.push({ url: asset.url, filename: asset.filename });
    }
  }
  if (fromSubmissions.length > 0) return fromSubmissions;
  return collaboration.highlights
    .filter((h) => h.url)
    .map((h) => ({ url: h.url, filename: h.filename }));
}

interface CollaborationCardProps {
  collaboration: Collaboration;
  onClick: () => void;
}

export function CollaborationCard({ collaboration, onClick }: CollaborationCardProps) {
  const submissionPieces = collaboration.submissions.reduce((s, sub) => s + sub.assets.length, 0);
  const pieceCount =
    submissionPieces > 0 ? submissionPieces : collaboration.highlights.length;
  const assets = previewAssets(collaboration);
  const [first, second] = assets;
  const overflow = Math.max(0, assets.length - 2);
  const isSingle = assets.length === 1;

  return (
    <button
      type="button"
      onClick={onClick}
      className="p-4 bg-muted rounded-md flex flex-col gap-2 border border-transparent hover:shadow-hub-xs hover:border-border transition-all"
    >
      <div className="grid grid-cols-2 grid-rows-2 gap-1 shrink-0 overflow-hidden w-full h-64">
        <div
          className={`relative min-h-0 ${isSingle ? "col-span-2 row-span-2" : "row-span-2 col-span-1"}`}
        >
          {first ? (
            <AssetThumbnail src={first.url} filename={first.filename} className="h-full w-full rounded" />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded bg-muted text-xs text-muted-foreground">
              No preview
            </div>
          )}
        </div>
        {!isSingle && second && (
          <div className="relative w-full h-full min-h-0">
            <AssetThumbnail src={second.url} filename={second.filename} className="h-full w-full rounded" />
          </div>
        )}
        {!isSingle && overflow > 0 && (
          <div className="flex items-center justify-center bg-foreground/10 text-sm font-semibold text-foreground rounded">
            +{overflow}
          </div>
        )}
      </div>
      <div>
        <div className="flex flex-col min-w-0 flex-1">
          <h1 className="text-lg font-medium truncate text-left">{collaboration.projectName}</h1>
        </div>
        <div className="flex items-end gap-3 shrink-0 justify-between">
          <div className="flex items-center gap-1 flex-wrap">
            <p className="text-xs text-muted-foreground">
              {collaboration.submissions.length} submission
              {collaboration.submissions.length !== 1 ? "s" : ""}
            </p>
            ·
            <p className="text-xs text-muted-foreground">
              {pieceCount} piece{pieceCount !== 1 ? "s" : ""}
            </p>
            ·
            <p className="text-xs text-muted-foreground">
              {new Date(collaboration.createdAt).toLocaleDateString()}
            </p>
          </div>
          <StatusBadge status={collaboration.status} />
          <ChevronRight className="hidden h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </button>
  );
}
