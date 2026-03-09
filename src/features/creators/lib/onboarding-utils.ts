import type { CreatorProfile } from "@/features/creators/actions/portal/get-creator-profile";
import type { OnboardingData } from "@/features/creators/components/portal/onboarding/onboarding-types";
import type {
  AgeDemographic,
  ContentFormat,
  Ethnicity,
  GenderIdentity,
  Language,
  UgcCategory,
} from "@/shared/lib/constants";

export const MIN_PORTFOLIO_VIDEOS = 2;
export const MAX_PORTFOLIO_VIDEOS = 5;

export function buildOnboardingData(creator: CreatorProfile): OnboardingData {
  return {
    fullName: creator.fullName ?? "",
    country: creator.country ?? "",
    languages: (creator.languages ?? []) as Language[],
    instagramHandle: creator.socialChannels?.instagram_handle ?? "",
    tiktokHandle: creator.socialChannels?.tiktok_handle ?? "",
    youtubeHandle: creator.socialChannels?.youtube_handle ?? "",
    portfolioUrl: creator.portfolioUrl ?? "",
    ugcCategories: (creator.ugcCategories ?? []) as UgcCategory[],
    contentFormats: (creator.contentFormats ?? []) as ContentFormat[],
    profilePhoto: creator.profilePhoto ?? "",
    rateRangeSelf: creator.rateRangeSelf ?? null,
    genderIdentity: (creator.genderIdentity ?? "") as GenderIdentity | "",
    ageDemographic: (creator.ageDemographic ?? "") as AgeDemographic | "",
    ethnicity: (creator.ethnicity ?? "") as Ethnicity | "",
  };
}

export function canProceed(step: number, data: OnboardingData, videoCount = 0): boolean {
  switch (step) {
    case 1:
      return data.fullName.trim().length > 0;
    case 2:
      return (
        data.instagramHandle.trim().length > 0 ||
        data.tiktokHandle.trim().length > 0 ||
        data.youtubeHandle.trim().length > 0
      );
    case 3:
      return data.ugcCategories.length > 0;
    case 4:
      return data.contentFormats.length > 0;
    case 5:
      return data.profilePhoto.trim().length > 0;
    case 6:
      return videoCount >= MIN_PORTFOLIO_VIDEOS;
    case 7:
      return data.rateRangeSelf !== null;
    case 8:
      return (
        data.country.length > 0 &&
        data.languages.length > 0 &&
        data.genderIdentity.length > 0 &&
        data.ageDemographic.length > 0 &&
        data.ethnicity.length > 0
      );
    case 9:
      return true;
    default:
      return true;
  }
}
