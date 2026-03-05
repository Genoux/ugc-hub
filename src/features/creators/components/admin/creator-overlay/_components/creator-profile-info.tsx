"use client";

import { Copy, ExternalLink } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import type { CreatorProfile } from "@/features/creators/actions/admin/get-creator-profile";
import { LabeledField } from "@/features/creators/components/labeled-field";
import type { SocialPlatform } from "@/features/creators/constants";
import { RatingBadge } from "@/shared/components/blocks/rating-badge";
import { SocialIcon } from "@/shared/components/icons/socials/social-icon";
import { VerifiedBadge } from "@/shared/components/icons/verified-badge";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";

interface CreatorProfileInfoProps {
  creator: CreatorProfile;
  /**
   * "sidebar" (default): always-stacked layout for the fixed-width desktop sidebar.
   * "mobile": image + name side-by-side on phones wider than 400px, stacked below.
   */
  layout?: "sidebar" | "mobile";
}

export function CreatorProfileInfo({ creator, layout = "sidebar" }: CreatorProfileInfoProps) {
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

  const profileHero = (
    <div className="relative aspect-4/5 w-full rounded-2xl overflow-hidden bg-muted">
      <Image
        src={creator.profilePhotoUrl || ""}
        alt={creator.fullName}
        fill
        unoptimized
        className="object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-full bg-black/20 backdrop-blur-xs pointer-events-none"
        style={{
          maskImage: "linear-gradient(to top, black 0%, black 10%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to top, black 0%, black 10%, transparent 100%)",
        }}
      />
      <div className="absolute inset-0 flex flex-col bg-linear-to-b from-transparent to-black/60 p-4">
        <div className="mt-auto flex flex-col gap-1">
          <div className="flex flex-col gap-2">
            <RatingBadge rating={creator.overallRating} className="w-fit" />
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white text-xl truncate">{creator.fullName}</h3>
              {creator.overallRating === "top creator" && <VerifiedBadge className="size-5" />}
            </div>
          </div>
        </div>
      </div>
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

  const details = (
    <>
      <hr />
      <div className="space-y-3">
        <div className="flex items-center gap-6 justify-start">
          <LabeledField label="Country" value={creator.country} />
          <LabeledField label="Languages" value={creator.languages?.join(", ")} />
        </div>
      </div>

      {(creator.ageDemographic || creator.genderIdentity || creator.ethnicity) && (
        <div className="space-y-3 border-t border-border pt-3">
          <LabeledField label="Age range" value={creator.ageDemographic} />
          <LabeledField label="Gender" value={creator.genderIdentity} />
          <LabeledField label="Ethnicity" value={creator.ethnicity} />
        </div>
      )}

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

      <div className="flex items-center gap-2">
        {socialLinks.map(({ label, handle }) => (
          <SocialIcon key={label} name={label as SocialPlatform} handle={handle} />
        ))}
        {creator.portfolioUrl && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => window.open(creator.portfolioUrl ?? "", "_blank")}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{creator.portfolioUrl}</TooltipContent>
          </Tooltip>
        )}
      </div>
      <hr />
      {rateRange && <LabeledField label="Rate" value={`$${rateRange.min}–${rateRange.max}`} />}
    </>
  );

  if (layout === "mobile") {
    return (
      <div className="px-4 pb-6 space-y-4">
        <div className="flex flex-col min-[400px]:flex-row gap-4">
          <div className="w-full min-[400px]:w-[45%] shrink-0">{profileHero}</div>
          <div className="flex flex-col gap-3 justify-end min-w-0">{copyEmailButton}</div>
        </div>
        {details}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {profileHero}
      {copyEmailButton}
      {details}
    </div>
  );
}
