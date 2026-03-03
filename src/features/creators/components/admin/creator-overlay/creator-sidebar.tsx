"use client";

import { Copy, X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import type { CreatorProfile } from "@/features/creators/actions/admin/get-creator-profile";
import { calculateRatingsFromCollaborations } from "@/features/creators/lib/calculated-ratings";
import { RatingBadge } from "@/features/creators/components/rating-badge";
import { LabeledField } from "@/features/creators/components/labeled-field";
import { RATING_LABELS } from "@/features/creators/constants";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle } from "@/shared/components/ui/sheet";

interface CreatorSidebarProps {
  creator: CreatorProfile;
  sheetOpen: boolean;
  onSheetOpenChange: (open: boolean) => void;
}

export function CreatorSidebar({ creator, sheetOpen, onSheetOpenChange }: CreatorSidebarProps) {
  const closedCollabs = creator.closedCollaborations ?? [];
  const calculatedRatings = calculateRatingsFromCollaborations(closedCollabs);
  const overallRating = calculatedRatings?.overall ?? creator.overallRating ?? "untested";
  const rateRange = creator.rateRangeInternal || creator.rateRangeSelf;

  const socialLinks = [
    creator.socialChannels?.instagram_handle && {
      label: "Instagram",
      handle: `@${creator.socialChannels.instagram_handle}`,
    },
    creator.socialChannels?.tiktok_handle && {
      label: "TikTok",
      handle: `@${creator.socialChannels.tiktok_handle}`,
    },
    creator.socialChannels?.youtube_handle && {
      label: "YouTube",
      handle: `@${creator.socialChannels.youtube_handle}`,
    },
  ].filter(Boolean) as { label: string; handle: string }[];

  const content = (
    <div className="pt-0 px-4 sm:px-6 pb-6 space-y-4">
      <div className="relative aspect-[4/5] w-full max-w-[200px] mx-auto sm:max-w-none sm:mx-0 rounded-2xl overflow-hidden bg-muted">
        {creator.profilePhotoUrl && (
          <Image
            src={creator.profilePhotoUrl}
            alt={creator.fullName}
            fill
            unoptimized
            className="object-cover"
          />
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full gap-2"
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

      <div className="flex items-center gap-2 justify-between">
        <h1 className="text-lg font-bold text-foreground leading-tight">{creator.fullName}</h1>
        <div className="flex items-center gap-2 mt-1.5">
          <RatingBadge rating={overallRating} />
        </div>
      </div>

      {calculatedRatings && (
        <>
          <hr />
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Ratings
            </p>
            {[
              { label: "Overall", rating: calculatedRatings.overall },
              { label: RATING_LABELS.visual_quality, rating: calculatedRatings.visual_quality },
              {
                label: RATING_LABELS.acting_line_delivery,
                rating: calculatedRatings.acting_line_delivery,
              },
              {
                label: RATING_LABELS.reliability_speed,
                rating: calculatedRatings.reliability_speed,
              },
            ].map(({ label, rating }) => (
              <LabeledField
                className="flex-row"
                key={label}
                label={label}
                value={<RatingBadge rating={rating} />}
              />
            ))}
          </div>
        </>
      )}

      <hr />

      <div className="space-y-3">
        <div className="flex items-center gap-6 justify-start">
          <LabeledField label="Country" value={creator.country} />
          <LabeledField label="Languages" value={creator.languages?.join(", ")} />
        </div>
        <LabeledField label="Age range" value={creator.ageDemographic} />
        <LabeledField label="Gender" value={creator.genderIdentity} />
        <LabeledField label="Ethnicity" value={creator.ethnicity} />
      </div>

      {creator.ugcCategories?.length || creator.contentFormats?.length ? (
        <>
          <hr />
          <div className="space-y-3">
            {creator.ugcCategories && creator.ugcCategories.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">UGC Categories</p>
                <div className="flex flex-wrap gap-1.5">
                  {creator.ugcCategories.map((cat) => (
                    <Badge key={cat} variant="outline" className="px-3 py-1">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {creator.contentFormats && creator.contentFormats.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Content Formats</p>
                <div className="flex flex-wrap gap-1.5">
                  {creator.contentFormats.map((format) => (
                    <Badge key={format} variant="outline" className="px-3 py-1">
                      {format}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      ) : null}
      <hr />

      {socialLinks.length > 0 &&
        socialLinks.map(({ label, handle }) => (
          <LabeledField key={label} label={label} value={handle} />
        ))}

      <hr />
      {rateRange && <LabeledField label="Rate" value={`$${rateRange.min}–${rateRange.max}`} />}
    </div>
  );

  return (
    <>
      <Sheet open={sheetOpen} onOpenChange={onSheetOpenChange}>
        <SheetContent side="left" className="w-[min(280px,85vw)] sm:w-80 p-0 gap-0 flex flex-col" showCloseButton={false}>
          <SheetTitle className="sr-only">{creator.fullName} details</SheetTitle>
          <div className="w-full ml-auto flex justify-end px-4 py-2">
            <SheetClose asChild>
              <Button variant="ghost" size="icon-sm">
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </div>
          <div className="overflow-y-auto flex-1">{content}</div>
        </SheetContent>
      </Sheet>

      {/* Desktop: inline sidebar */}
      <div className="hidden sm:block w-80 shrink-0 border-r border-border overflow-y-auto">
        {content}
      </div>
    </>
  );
}
