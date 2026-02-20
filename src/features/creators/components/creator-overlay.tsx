"use client";

import { ChevronLeft, ChevronRight, Copy, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AssetCard } from "@/shared/components/asset-card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Sheet, SheetContent, SheetHeader } from "@/shared/components/ui/sheet";
import type { CreatorProfileAssetsResult } from "../actions/get-creator-profile-assets";
import { getCreatorProfileAssets } from "../actions/get-creator-profile-assets";
import { RATING_CONFIG, RATING_LABELS } from "../constants";
import { calculateRatingsFromCollaborations } from "../lib/calculated-ratings";
import type { Creator } from "../schemas";

interface CreatorOverlayProps {
  creator: Creator;
  creators: Creator[];
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function CreatorOverlay({
  creator,
  creators,
  onClose,
  onPrev,
  onNext,
}: CreatorOverlayProps) {
  const currentIdx = creators.findIndex((c) => c.id === creator.id);
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx < creators.length - 1;

  const [profileAssets, setProfileAssets] = useState<CreatorProfileAssetsResult | null>(null);
  const [profileAssetsLoading, setProfileAssetsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setProfileAssetsLoading(true);
    setProfileAssets(null);
    getCreatorProfileAssets(creator.id)
      .then((data) => {
        if (!cancelled) setProfileAssets(data);
      })
      .finally(() => {
        if (!cancelled) setProfileAssetsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [creator.id]);

  const calculatedRatings = calculateRatingsFromCollaborations(creator.collaborations ?? []);
  const overallRating = calculatedRatings?.overall ?? creator.overallRating;
  const ratingConfig = RATING_CONFIG[overallRating] || RATING_CONFIG.untested;
  const rateRange = creator.rateRangeInternal || creator.rateRangeSelf;
  const hasCollabs = creator.collaborations && creator.collaborations.length > 0;

  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        className="h-[calc(100%-32px)] max-w-none w-full p-0 rounded-t-2xl gap-0 [&>button.absolute]:hidden"
      >
        <SheetHeader className="shrink-0 flex flex-row items-center justify-between border-b border-border bg-background px-6 py-4">
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
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close creator profile">
            <X className="h-5 w-5" />
          </Button>
        </SheetHeader>

        <div className="flex-1 min-h-0 overflow-y-auto pb-8">
          <div className="flex min-h-full">
            {/* Left Sidebar */}
            <div className="w-80 shrink-0 border-r border-border p-6">
              <div className="relative mb-4 aspect-[4/5] w-full rounded-2xl overflow-hidden bg-muted">
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
                    (avg of {creator.collaborations?.length ?? 0} collaboration
                    {(creator.collaborations?.length ?? 0) === 1 ? "" : "s"})
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
            <div className="flex-1 min-w-0 p-6">
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
                {profileAssetsLoading ? (
                  <div className="columns-2 gap-2 sm:columns-3 lg:columns-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="aspect-video w-full animate-pulse bg-muted rounded-lg mb-2 break-inside-avoid"
                      />
                    ))}
                  </div>
                ) : profileAssets && profileAssets.pastWork.length > 0 ? (
                  <div className="columns-2 gap-2 sm:columns-3 lg:columns-4">
                    {profileAssets.pastWork.map((asset) => (
                      <AssetCard
                        key={asset.id}
                        src={asset.url}
                        filename={asset.filename}
                        isVideo={asset.mimeType.startsWith("video/")}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-4">No past work uploaded yet.</p>
                )}
              </div>

              {/* Fieldtrip portfolio (curated by us) */}
              <div className="mb-8">
                <h2 className="text-base font-semibold text-foreground mb-4">
                  Fieldtrip portfolio
                  {profileAssets && (
                    <span className="text-muted-foreground font-normal ml-2">
                      ({profileAssets.creatorPortfolioAssets.length})
                    </span>
                  )}
                </h2>
                {profileAssetsLoading ? (
                  <div className="columns-2 gap-2 sm:columns-3 lg:columns-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="aspect-video w-full animate-pulse bg-muted rounded-lg mb-2 break-inside-avoid"
                      />
                    ))}
                  </div>
                ) : profileAssets && profileAssets.creatorPortfolioAssets.length > 0 ? (
                  <div className="columns-2 gap-2 sm:columns-3 lg:columns-4">
                    {profileAssets.creatorPortfolioAssets.map((asset) => (
                      <AssetCard
                        key={asset.id}
                        src={asset.url}
                        filename={asset.filename}
                        isVideo={asset.mimeType.startsWith("video/")}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-4">
                    No portfolio assets yet. Add when closing a collaboration.
                  </p>
                )}
              </div>

              <div>
                <h2 className="text-base font-semibold text-foreground mb-4">
                  Collaborations{" "}
                  {hasCollabs && (
                    <span className="text-muted-foreground font-normal">
                      ({creator.collaborations.length})
                    </span>
                  )}
                </h2>
                {hasCollabs ? (
                  <div className="space-y-3">
                    {creator.collaborations.map((collab) => (
                      <div
                        key={collab.id}
                        className="rounded-2xl border border-border bg-card overflow-hidden"
                      >
                        <div className="px-6 py-5">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-base font-semibold text-foreground">
                              {collab.brand}
                            </h3>
                            <span className="text-lg font-bold text-foreground">
                              ${collab.total_paid.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(collab.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="border-t border-border px-6 py-4">
                          <div className="grid grid-cols-3 gap-4">
                            <div className="bg-muted/60 rounded-xl px-4 py-3">
                              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                                Per piece
                              </span>
                              <p className="text-base font-semibold text-foreground mt-1">
                                ${collab.per_piece_rate}
                              </p>
                            </div>
                            <div className="bg-muted/60 rounded-xl px-4 py-3">
                              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                                Total paid
                              </span>
                              <p className="text-base font-semibold text-foreground mt-1">
                                ${collab.total_paid.toLocaleString()}
                              </p>
                            </div>
                            <div className="bg-muted/60 rounded-xl px-4 py-3">
                              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                                Content pieces
                              </span>
                              <p className="text-base font-semibold text-foreground mt-1">
                                {collab.pieces_of_content}
                              </p>
                            </div>
                          </div>
                          {collab.notes && (
                            <p className="text-sm text-muted-foreground italic mt-3 border-l-2 border-border pl-3">
                              "{collab.notes}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-6 text-center">
                    No collaborations logged yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
