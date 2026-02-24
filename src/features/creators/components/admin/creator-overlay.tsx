"use client";

import { ChevronLeft, ChevronRight, Copy, Download, X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import type { CreatorProfileAssetsResult } from "@/features/creators/actions/admin/get-creator-profile-assets";
import { RATING_CONFIG, RATING_LABELS } from "@/features/creators/constants";
import { calculateRatingsFromCollaborations } from "@/features/creators/lib/calculated-ratings";
import type { Creator } from "@/features/creators/schemas";
import { downloadAssets } from "@/features/submissions/lib/download-assets";
import { AssetCard } from "@/shared/components/asset-card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Sheet, SheetContent, SheetHeader } from "@/shared/components/ui/sheet";

interface CreatorOverlayProps {
  creator: Creator;
  creators: Creator[];
  profileAssets: CreatorProfileAssetsResult | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function CreatorOverlay({
  creator,
  creators,
  profileAssets,
  onClose,
  onPrev,
  onNext,
}: CreatorOverlayProps) {
  const currentIdx = creators.findIndex((c) => c.id === creator.id);
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx < creators.length - 1;

  const closedCollabs = profileAssets?.closedCollaborations ?? [];
  const calculatedRatings = calculateRatingsFromCollaborations(closedCollabs);
  const overallRating = calculatedRatings?.overall ?? creator.overallRating;
  const ratingConfig = RATING_CONFIG[overallRating] || RATING_CONFIG.untested;
  const rateRange = creator.rateRangeInternal || creator.rateRangeSelf;

  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent side="bottom" showCloseButton={false} className="rounded-t-2xl overflow-hidden">
        <div className="flex h-[calc(100vh-5rem)] flex-col">
          <SheetHeader className="shrink-0 flex flex-row items-center justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onPrev}
                disabled={!hasPrev}
                aria-label="Previous creator"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onNext}
                disabled={!hasNext}
                aria-label="Next creator"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close creator profile"
            >
              <X className="h-5 w-5" />
            </Button>
          </SheetHeader>

          <div className="flex flex-1 min-h-0">
            {/* Left Sidebar */}
            <div className="w-80 shrink-0 border-r border-border p-6 overflow-y-auto">
              <div className="relative mb-4 aspect-square w-full rounded-2xl overflow-hidden bg-muted">
                {creator.profilePhoto ? (
                  <Image
                    src={creator.profilePhoto}
                    alt={creator.fullName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-6xl font-light text-muted-foreground">
                    {creator.fullName[0]}
                  </div>
                )}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full gap-2 mb-4"
                onClick={() => {
                  if (creator.email) {
                    void navigator.clipboard.writeText(creator.email);
                    toast.success("Email copied");
                  }
                }}
                disabled={!creator.email}
              >
                <Copy className="h-3.5 w-3.5" />
                Copy email
              </Button>

              <h1 className="text-lg font-bold text-foreground leading-tight">
                {creator.fullName}
              </h1>
              <div className="flex items-center gap-2 mt-1.5 mb-1">
                <Badge variant="outline" className={ratingConfig.className}>
                  {overallRating}
                </Badge>
                {calculatedRatings && (
                  <span className="text-[10px] text-muted-foreground">
                    (avg of {closedCollabs.length} collaboration
                    {closedCollabs.length === 1 ? "" : "s"})
                  </span>
                )}
              </div>
              {calculatedRatings && (
                <div className="border-t border-border pt-4 mb-4">
                  <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
                    Ratings
                  </h3>
                  <p className="text-[10px] text-muted-foreground mb-2">
                    Overall and each dimension calculated from collaboration averages.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground">Overall</span>
                      <Badge variant="outline" className={`text-[10px] ${ratingConfig.className}`}>
                        {calculatedRatings.overall}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground">
                        {RATING_LABELS.visual_quality}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${(RATING_CONFIG[calculatedRatings.visual_quality] ?? RATING_CONFIG.untested).className}`}
                      >
                        {calculatedRatings.visual_quality}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground">
                        {RATING_LABELS.acting_line_delivery}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${(RATING_CONFIG[calculatedRatings.acting_line_delivery] ?? RATING_CONFIG.untested).className}`}
                      >
                        {calculatedRatings.acting_line_delivery}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground">
                        {RATING_LABELS.reliability_speed}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${(RATING_CONFIG[calculatedRatings.reliability_speed] ?? RATING_CONFIG.untested).className}`}
                      >
                        {calculatedRatings.reliability_speed}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
              {creator.country && (
                <p className="text-xs text-muted-foreground mb-4">{creator.country}</p>
              )}

              {creator.socialChannels && (
                <div className="bg-muted rounded-xl p-3 space-y-0.5 mb-5">
                  <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5 px-1">
                    Profiles
                  </h3>
                  {creator.socialChannels.instagram_handle && (
                    <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-foreground">
                      <span>@{creator.socialChannels.instagram_handle}</span>
                    </div>
                  )}
                  {creator.socialChannels.tiktok_handle && (
                    <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-foreground">
                      <span>@{creator.socialChannels.tiktok_handle}</span>
                    </div>
                  )}
                  {creator.socialChannels.youtube_handle && (
                    <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-foreground">
                      <span>@{creator.socialChannels.youtube_handle}</span>
                    </div>
                  )}
                </div>
              )}

              {rateRange && (
                <div className="border-t border-border pt-4">
                  <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
                    Rates
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Rate Range</span>
                      <span className="text-sm font-semibold text-foreground">
                        ${rateRange.min}–${rateRange.max}
                      </span>
                    </div>
                    {creator.rateRangeInternal && (
                      <p className="text-[10px] text-muted-foreground">
                        Estimated from past collaborations
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Content */}
            <div className="flex-1 min-w-0 p-6 overflow-y-auto pb-8">
              <div className="bg-muted rounded-2xl p-5 mb-6">
                <h2 className="text-sm font-semibold text-foreground mb-4">About</h2>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <div className="space-y-3">
                    {creator.ageDemographic && (
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                          Age Range
                        </span>
                        <p className="text-xs font-medium text-foreground">
                          {creator.ageDemographic}
                        </p>
                      </div>
                    )}
                    {creator.genderIdentity && (
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                          Gender
                        </span>
                        <p className="text-xs font-medium text-foreground">
                          {creator.genderIdentity}
                        </p>
                      </div>
                    )}
                    {creator.ethnicity && (
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                          Ethnicity
                        </span>
                        <p className="text-xs font-medium text-foreground">{creator.ethnicity}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    {creator.languages && creator.languages.length > 0 && (
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                          Languages
                        </span>
                        <p className="text-xs font-medium text-foreground">
                          {creator.languages
                            .map((l) => (l.accent ? `${l.language} (${l.accent})` : l.language))
                            .join(", ")}
                        </p>
                      </div>
                    )}
                    {creator.country && (
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                          Country
                        </span>
                        <p className="text-xs font-medium text-foreground">{creator.country}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                {creator.ugcCategories && creator.ugcCategories.length > 0 && (
                  <div>
                    <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
                      UGC Categories
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {creator.ugcCategories.map((cat) => (
                        <Badge
                          key={cat}
                          variant="outline"
                          className="bg-muted text-foreground border-border"
                        >
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {creator.contentFormats && creator.contentFormats.length > 0 && (
                  <div>
                    <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
                      Content Formats
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {creator.contentFormats.map((format) => (
                        <Badge
                          key={format}
                          variant="outline"
                          className="bg-accent text-accent-foreground border-border"
                        >
                          {format}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Past work (creator uploads) */}
              <div className="mb-8">
                <h2 className="text-base font-semibold text-foreground mb-4">
                  Past work
                  {profileAssets && (
                    <span className="text-muted-foreground font-normal ml-2">
                      ({profileAssets.pastWork.length})
                    </span>
                  )}
                </h2>
                {profileAssets && profileAssets.pastWork.length > 0 ? (
                  <div className="columns-2 gap-2 sm:columns-3 lg:columns-4">
                    {profileAssets.pastWork.map((asset) => (
                      <AssetCard
                        key={asset.id}
                        src={asset.url}
                        filename={asset.filename}
                        isVideo={asset.mimeType.startsWith("video/")}
                        action={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white! hover:bg-white/20"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadAssets([{ id: asset.id, filename: asset.filename }], {
                                onError: () => toast.error("Download failed"),
                              });
                            }}
                          >
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Download</span>
                          </Button>
                        }
                      />
                    ))}
                  </div>
                ) : profileAssets ? (
                  <p className="text-sm text-muted-foreground py-4">No past work uploaded yet.</p>
                ) : null}
              </div>

              <div>
                <h2 className="text-base font-semibold text-foreground mb-4">
                  Collaborations
                  {closedCollabs.length > 0 && (
                    <span className="text-muted-foreground font-normal ml-2">
                      ({closedCollabs.length})
                    </span>
                  )}
                </h2>
                {closedCollabs.length > 0 ? (
                  <div className="space-y-3">
                    {closedCollabs.map((collab) => {
                      const totalPaid =
                        collab.totalPaidCents != null ? collab.totalPaidCents / 100 : null;
                      const perPiece =
                        totalPaid != null && collab.piecesOfContent
                          ? totalPaid / collab.piecesOfContent
                          : null;
                      return (
                        <div
                          key={collab.id}
                          className="rounded-2xl border border-border bg-card overflow-hidden"
                        >
                          <div className="px-6 py-5">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-base font-semibold text-foreground">
                                {collab.submissionName}
                              </h3>
                              {totalPaid != null && (
                                <span className="text-lg font-bold text-foreground">
                                  ${totalPaid.toLocaleString()}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {collab.closedAt.toLocaleDateString()}
                            </p>
                          </div>
                          <div className="border-t border-border px-6 py-4">
                            <div className="grid grid-cols-3 gap-4">
                              {perPiece != null && (
                                <div className="bg-muted/60 rounded-xl px-4 py-3">
                                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                                    Per piece
                                  </span>
                                  <p className="text-base font-semibold text-foreground mt-1">
                                    ${perPiece.toFixed(2)}
                                  </p>
                                </div>
                              )}
                              {totalPaid != null && (
                                <div className="bg-muted/60 rounded-xl px-4 py-3">
                                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                                    Total paid
                                  </span>
                                  <p className="text-base font-semibold text-foreground mt-1">
                                    ${totalPaid.toLocaleString()}
                                  </p>
                                </div>
                              )}
                              {collab.piecesOfContent != null && (
                                <div className="bg-muted/60 rounded-xl px-4 py-3">
                                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                                    Content pieces
                                  </span>
                                  <p className="text-base font-semibold text-foreground mt-1">
                                    {collab.piecesOfContent}
                                  </p>
                                </div>
                              )}
                            </div>
                            {collab.reviewNotes && (
                              <p className="text-sm text-muted-foreground italic mt-3 border-l-2 border-border pl-3">
                                "{collab.reviewNotes}"
                              </p>
                            )}
                            {collab.portfolioAssets.length > 0 && (
                              <div className="mt-4">
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
                                  Fieldtrip portfolio ({collab.portfolioAssets.length})
                                </p>
                                <div className="columns-2 gap-2 sm:columns-3 lg:columns-4">
                                  {collab.portfolioAssets.map((asset) => (
                                    <AssetCard
                                      key={asset.id}
                                      src={asset.url}
                                      filename={asset.filename}
                                      isVideo={asset.mimeType.startsWith("video/")}
                                      action={
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-white hover:bg-white/20"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            downloadAssets(
                                              [{ id: asset.id, filename: asset.filename }],
                                              { onError: () => toast.error("Download failed") },
                                            );
                                          }}
                                        >
                                          <Download className="h-4 w-4" />
                                          <span className="sr-only">Download</span>
                                        </Button>
                                      }
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : profileAssets ? (
                  <p className="text-sm text-muted-foreground py-6 text-center">
                    No collaborations logged yet.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
