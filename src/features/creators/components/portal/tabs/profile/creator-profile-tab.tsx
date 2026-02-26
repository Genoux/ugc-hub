import { BadgeCheck } from "lucide-react";
import Image from "next/image";
import type { CreatorProfile } from "@/features/creators/actions/portal/get-creator-profile";
import type { CreatorUIState } from "@/features/creators/lib/get-creator-ui-state";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { ProfileEmptyState } from "./profile-empty-state";
import { Field, Tags } from "./profile-fields";
import { ProfilePortfolio } from "./profile-portfolio";
import { ProfileSocials } from "./profile-socials";

interface CreatorProfileTabProps {
  creator: CreatorProfile;
  uiState: CreatorUIState;
  onOpenOnboarding?: () => void;
}

export function CreatorProfileTab({ creator, uiState, onOpenOnboarding }: CreatorProfileTabProps) {
  if (uiState !== "live") {
    return (
      <ProfileEmptyState
        uiState={uiState}
        creatorName={creator.fullName}
        onOpenOnboarding={onOpenOnboarding}
      />
    );
  }

  const socials = creator.socialChannels;
  const socialLinks = [
    socials?.instagram_handle && {
      label: "Instagram",
      handle: `@${socials.instagram_handle}`,
    },
    socials?.tiktok_handle && {
      label: "TikTok",
      handle: `@${socials.tiktok_handle}`,
    },
    socials?.youtube_handle && {
      label: "YouTube",
      handle: `@${socials.youtube_handle}`,
    },
  ].filter(Boolean) as { label: string; handle: string }[];

  const profilePhotoUrl = creator.profilePhotoUrl ?? "";

  return (
    <div className=" pb-40 grid grid-cols-12 gap-16">
      <div className="col-span-4 w-full sticky top-0 self-start ">
        <div className="relative w-full h-80 rounded-lg shadow-hub bg-muted flex items-center justify-center overflow-hidden">
          <div
            className="hidden pointer-events-none absolute inset-0 z-10 rounded-lg bg-linear-to-bl from-[#190407]/80 via-transparent"
            aria-hidden
          />
          <Image src={profilePhotoUrl} alt={creator.fullName} fill className="object-cover" />
          <Tooltip>
            <TooltipTrigger asChild className="pointer-events-auto hidden">
              <div className="flex justify-center items-center absolute top-2 right-2 z-50 h-8 w-8">
                <BadgeCheck className="size-6 text-white " />
              </div>
            </TooltipTrigger>
            <TooltipContent>Profile is verified and live</TooltipContent>
          </Tooltip>
        </div>
        <div className="w-full pt-4 flex flex-col gap-4">
          <Field label="Country" value={creator.country} />
          <Field label="Gender" value={creator.genderIdentity} />
          <Field label="Languages" value={creator.languages?.join(", ")} />
          <Field label="Age group" value={creator.ageDemographic} />
          <Field label="Ethnicity" value={creator.ethnicity} />
          <hr />
          <ProfileSocials
            links={[...socialLinks, { label: "Portfolio", handle: creator.portfolioUrl ?? "" }]}
          />
          <hr />
          <Field
            label="Rate"
            value={`$${creator.rateRangeSelf?.min} – $${creator.rateRangeSelf?.max} / video`}
          />
        </div>
      </div>

      <div className="col-span-8 flex flex-col gap-6">
        <h1 className="text-5xl font-bold">{creator.fullName}</h1>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2">UGC Categories</p>
            <Tags values={creator.ugcCategories} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Content Formats</p>
            <Tags values={creator.contentFormats} />
          </div>
        </div>
        <hr />
        <ProfilePortfolio creator={creator} />
      </div>
    </div>
  );
}
