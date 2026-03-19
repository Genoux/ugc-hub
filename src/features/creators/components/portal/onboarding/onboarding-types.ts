import type {
  AgeDemographic,
  ContentFormat,
  Ethnicity,
  GenderIdentity,
  Language,
  UgcCategory,
} from "@/shared/lib/constants";

//TODO: Rename for Onboarding or OnboardingPayload
export interface OnboardingData {
  // Step 1
  fullName: string;
  country: string;
  languages: Language[];
  // Step 2
  instagramUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
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
  ethnicities: Ethnicity[];
}

export const INITIAL_ONBOARDING_DATA: OnboardingData = {
  fullName: "",
  country: "",
  languages: [],
  instagramUrl: "",
  tiktokUrl: "",
  youtubeUrl: "",
  portfolioUrl: "",
  ugcCategories: [],
  contentFormats: [],
  profilePhoto: "",
  rateRangeSelf: null,
  genderIdentity: "",
  ageDemographic: "",
  ethnicities: [],
};

import type { CreatorProfile } from "@/features/creators/actions/portal/get-creator-profile";

export interface OnboardingProps {
  creator: CreatorProfile;
  onComplete: () => void;
  onClose: () => void;
}
