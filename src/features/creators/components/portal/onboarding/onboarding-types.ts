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

import type {
  AgeDemographic,
  ContentFormat,
  Ethnicity,
  GenderIdentity,
  Language,
  UgcCategory,
} from "@/shared/lib/constants";

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

import type { CreatorProfile } from "@/features/creators/actions/portal/get-creator-profile";

export interface OnboardingProps {
  creator: CreatorProfile;
  onComplete: () => void;
  onClose: () => void;
}
