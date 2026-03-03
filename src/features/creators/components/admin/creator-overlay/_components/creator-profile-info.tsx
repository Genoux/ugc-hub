"use client";

import { Copy } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import type { CreatorProfile } from "@/features/creators/actions/admin/get-creator-profile";
import { calculateRatingsFromCollaborations } from "@/features/creators/lib/calculated-ratings";
import { RatingBadge } from "@/features/creators/components/rating-badge";
import { LabeledField } from "@/features/creators/components/labeled-field";
import { RATING_LABELS } from "@/features/creators/constants";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";

interface CreatorProfileInfoProps {
  creator: CreatorProfile;
  /**
   * "sidebar" (default): always-stacked layout for the fixed-width desktop sidebar.
   * "mobile": image + name side-by-side on phones wider than 400px, stacked below.
   */
  layout?: "sidebar" | "mobile";
}

export function CreatorProfileInfo({ creator, layout = "sidebar" }: CreatorProfileInfoProps) {
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

  const photo = (
    <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-muted">
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
  );

  const copyEmailButton = (
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
  );

  const nameAndRating = (
    <div className="flex items-center gap-2 justify-between">
      <h1 className="text-lg font-bold text-foreground leading-tight">{creator.fullName}</h1>
      <div className="flex items-center gap-2 mt-1.5">
        <RatingBadge rating={overallRating} />
      </div>
    </div>
  );

  const details = (
    <>
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

      {(creator.ugcCategories?.length || creator.contentFormats?.length) ? (
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
    </>
  );

  if (layout === "mobile") {
    return (
      <div className="px-4 pb-6 space-y-4">
        {/* On wider phones: photo left, name + email right. On small phones: stacked. */}
        <div className="flex flex-col min-[400px]:flex-row gap-4">
          <div className="w-full min-[400px]:w-[45%] shrink-0">{photo}</div>
          <div className="flex flex-col gap-3 justify-end min-w-0">
            {nameAndRating}
            {copyEmailButton}
          </div>
        </div>
        {details}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {photo}
      {copyEmailButton}
      {nameAndRating}
      {details}
    </div>
  );
}
