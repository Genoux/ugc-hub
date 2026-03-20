import Image from "next/image";
import type { CreatorProfile } from "@/features/creators/actions/portal/get-creator-profile";
import { LabeledField } from "@/features/creators/components/labeled-field";
import type { CreatorUIState } from "@/features/creators/components/portal/creator-portal-shell";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { ProfileEmptyState } from "./profile-empty-state";
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
    socials?.instagram_url && {
      label: "Instagram",
      handle: socials.instagram_url.replace("https://", ""),
    },
    socials?.tiktok_url && {
      label: "TikTok",
      handle: socials.tiktok_url.replace("https://", ""),
    },
    socials?.youtube_url && {
      label: "YouTube",
      handle: socials.youtube_url.replace("https://", ""),
    },
  ].filter(Boolean) as { label: string; handle: string }[];

  const profilePhotoUrl = creator.profilePhotoUrl ?? "";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 max-w-xl lg:max-w-none w-full mx-auto">
      <div className="flex flex-col lg:col-span-4 w-full lg:sticky top-6 self-start gap-6 lg:gap-2">
        <div className="relative w-full h-56 lg:h-auto aspect-square lg:max-w-none lg:mx-0 rounded-4xl lg:rounded-sm shadow-hub bg-muted overflow-hidden">
          <Image
            src={profilePhotoUrl}
            alt={creator.fullName}
            fill
            className="object-cover"
          />
        </div>
        <div className="w-full lg:pt-4 flex flex-col gap-4">
          <div className="lg:hidden flex justify-between items-center pb-2 gap-6">
            <h1 className="text-2xl lg:text-5xl font-bold">{creator.fullName}</h1>
            {creator.profileCompleted && (
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={onOpenOnboarding}>
                  Edit profile
                </Button>
              </div>
            )}
          </div>
          <LabeledField label="Country" value={creator.country} />
          <LabeledField label="Gender" value={creator.genderIdentity} />
          <LabeledField label="Languages" value={creator.languages?.join(", ")} />
          <LabeledField label="Age group" value={creator.ageDemographic} />
          <LabeledField label="Ethnicity" value={creator.ethnicity?.join(", ")} />
          <hr />
          <ProfileSocials
            links={[...socialLinks, { label: "Portfolio", handle: creator.portfolioUrl ?? "" }]}
          />
          <hr />
          <LabeledField
            label="Rate"
            value={`$${creator.rateRangeSelf?.min} – $${creator.rateRangeSelf?.max} / video`}
          />
        </div>
      </div>

      <div className="lg:col-span-8 flex flex-col gap-6 lg:ml-10">
        <div className="hidden lg:flex justify-between items-center">
          <h1 className="text-5xl font-bold">{creator.fullName}</h1>
          {creator.profileCompleted && (
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={onOpenOnboarding}>
                Edit profile
              </Button>
            </div>
          )}
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2">UGC Categories</p>
            {creator.ugcCategories?.length ? (
              <div className="flex flex-wrap gap-1.5">
                {creator.ugcCategories.map((v) => (
                  <Badge key={v} variant="outline" className="px-3 py-1.5">
                    {v}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Content Formats</p>
            {creator.contentFormats?.length ? (
              <div className="flex flex-wrap gap-1.5">
                {creator.contentFormats.map((v) => (
                  <Badge key={v} variant="outline" className="px-3 py-1.5">
                    {v}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>
        </div>
        <hr />
        <ProfilePortfolio creator={creator} />
      </div>
    </div>
  );
}
