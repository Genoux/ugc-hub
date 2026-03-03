import { Copy } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import type { CreatorProfile } from "@/features/creators/actions/admin/get-creator-profile";
import { RATING_CONFIG, RATING_LABELS } from "@/features/creators/constants";
import { calculateRatingsFromCollaborations } from "@/features/creators/lib/calculated-ratings";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { PillTag } from "./_components/pill-tag";
import { SidebarField } from "./_components/sidebar-field";

interface CreatorSidebarProps {
  creator: CreatorProfile;
}

export function CreatorSidebar({ creator }: CreatorSidebarProps) {
  const closedCollabs = creator.closedCollaborations ?? [];
  const calculatedRatings = calculateRatingsFromCollaborations(closedCollabs);
  const overallRating = calculatedRatings?.overall ?? creator.overallRating ?? "untested";
  const ratingConfig = RATING_CONFIG[overallRating] || RATING_CONFIG.untested;
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

  return (
    <div className="w-80 shrink-0 border-r border-border p-6 overflow-y-auto space-y-4">
      <div className="relative aspect-3/4 w-full rounded-2xl overflow-hidden bg-muted">
        {creator.profilePhotoUrl && (
          <Image
            src={creator.profilePhotoUrl}
            alt={creator.fullName}
            fill
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
          <Badge variant="outline" className={ratingConfig.className}>
            {overallRating}
          </Badge>
        </div>
      </div>

      {calculatedRatings && (
        <>
          <hr />
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Ratings
            </p>
            {[
              { label: "Overall", rating: calculatedRatings.overall },
              {
                label: RATING_LABELS.visual_quality,
                rating: calculatedRatings.visual_quality,
              },
              {
                label: RATING_LABELS.acting_line_delivery,
                rating: calculatedRatings.acting_line_delivery,
              },
              {
                label: RATING_LABELS.reliability_speed,
                rating: calculatedRatings.reliability_speed,
              },
            ].map(({ label, rating }) => (
              <div key={label} className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">{label}</span>
                <Badge
                  variant="outline"
                  className={`text-xs ${(RATING_CONFIG[rating] ?? RATING_CONFIG.untested).className}`}
                >
                  {rating}
                </Badge>
              </div>
            ))}
          </div>
        </>
      )}

      <hr />

      <div className="space-y-3">
        <div className="flex items-center gap-6 justify-start">
          <SidebarField label="Country" value={creator.country} />
          <SidebarField label="Languages" value={creator.languages?.join(", ")} />
        </div>

        <SidebarField label="Age range" value={creator.ageDemographic} />
        <SidebarField label="Gender" value={creator.genderIdentity} />
        <SidebarField label="Ethnicity" value={creator.ethnicity} />
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
                    <PillTag key={cat} label={cat} />
                  ))}
                </div>
              </div>
            )}
            {creator.contentFormats && creator.contentFormats.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Content Formats</p>
                <div className="flex flex-wrap gap-1.5">
                  {creator.contentFormats.map((format) => (
                    <PillTag key={format} label={format} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      ) : null}

      {socialLinks.length > 0 && (
        <>
          <hr />
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Socials
            </p>
            {socialLinks.map(({ label, handle }) => (
              <div key={label}>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium text-foreground">{handle}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {rateRange && (
        <>
          <hr />
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
              Rate
            </p>
            <p className="text-sm font-semibold text-foreground">
              ${rateRange.min}–${rateRange.max}
            </p>
            {creator.rateRangeInternal && (
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Estimated from collaborations
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
