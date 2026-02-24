export interface PortfolioVideo {
  assetId: string;
  key: string;
  filename: string;
}

/** Completed in-wizard entry — extends PortfolioVideo with a local blob URL for preview. */
export interface PortfolioVideoEntry extends PortfolioVideo {
  objectUrl: string;
}

/** Transient in-wizard entry — exists while a file is uploading. */
export interface UploadingVideoEntry {
  tempId: string;
  objectUrl: string;
  filename: string;
}

export const MIN_PORTFOLIO_VIDEOS = 2;
export const MAX_PORTFOLIO_VIDEOS = 5;

import type {
  AgeDemographic,
  ContentFormat,
  Ethnicity,
  GenderIdentity,
  Language,
  UgcCategory,
} from "@/features/creators/constants";

export interface OnboardingData {
  // Step 1
  fullName: string;
  country: string;
  languages: Language[];
  // Step 2
  instagramHandle: string;
  tiktokHandle: string;
  youtubeHandle: string;
  portfolioUrl: string;
  // Step 3
  ugcCategories: UgcCategory[];
  // Step 4
  contentFormats: ContentFormat[];
  // Step 5
  profilePhoto: string;
  // Step 7
  rateRangeSelf: { min: number; max: number } | null;
  // Step 8
  genderIdentity: GenderIdentity | "";
  ageDemographic: AgeDemographic | "";
  ethnicity: Ethnicity | "";
}

export const INITIAL_ONBOARDING_DATA: OnboardingData = {
  fullName: "",
  country: "",
  languages: [],
  instagramHandle: "",
  tiktokHandle: "",
  youtubeHandle: "",
  portfolioUrl: "",
  ugcCategories: [],
  contentFormats: [],
  profilePhoto: "",
  rateRangeSelf: null,
  genderIdentity: "",
  ageDemographic: "",
  ethnicity: "",
};

import type { Creator } from "@/features/creators/schemas";

export function buildOnboardingData(creator: Creator): OnboardingData {
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

import type { CreatorProfile } from "@/features/creators/actions/portal/get-creator-profile";

export interface OnboardingProps {
  creator: CreatorProfile;
  onComplete: () => void;
  onClose: () => void;
}

export function canProceed(step: number, data: OnboardingData, portfolioVideoCount = 0): boolean {
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
      return true; // photo is optional
    case 6:
      return portfolioVideoCount >= MIN_PORTFOLIO_VIDEOS;
    case 7:
      return data.rateRangeSelf !== null;
    case 8:
      return data.country.length > 0 && data.languages.length > 0;
    case 9:
      return true;
    default:
      return true;
  }
}
