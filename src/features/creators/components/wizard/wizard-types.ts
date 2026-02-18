export interface WizardData {
  // Step 1
  fullName: string;
  country: string;
  languages: string[];
  // Step 2
  instagramHandle: string;
  tiktokHandle: string;
  youtubeHandle: string;
  portfolioUrl: string;
  // Step 3
  ugcCategories: string[];
  // Step 4
  contentFormats: string[];
  // Step 5
  profilePhoto: string;
  // Step 6
  portfolioVideoUrls: string[];
  // Step 7
  rateRangeSelf: { min: number; max: number } | null;
  // Step 8
  genderIdentity: string;
  ageDemographic: string;
  ethnicity: string;
}

export const INITIAL_WIZARD_DATA: WizardData = {
  fullName: "",
  country: "",
  languages: ["English"],
  instagramHandle: "",
  tiktokHandle: "",
  youtubeHandle: "",
  portfolioUrl: "",
  ugcCategories: [],
  contentFormats: [],
  profilePhoto: "",
  portfolioVideoUrls: ["", ""],
  rateRangeSelf: null,
  genderIdentity: "",
  ageDemographic: "",
  ethnicity: "",
};

export interface CreatorForWizard {
  id: string;
}

export interface ProfileWizardProps {
  creator: CreatorForWizard;
  initialData?: Partial<WizardData>;
  onComplete: () => void;
  onClose: () => void;
}

export function canProceed(step: number, data: WizardData): boolean {
  switch (step) {
    case 1:
      return data.fullName.trim().length > 0 && data.country.length > 0 && data.languages.length > 0;
    case 2:
      return (
        data.instagramHandle.trim().length > 0 ||
        data.tiktokHandle.trim().length > 0 ||
        data.youtubeHandle.trim().length > 0
      );
    case 3: return data.ugcCategories.length > 0;
    case 4: return data.contentFormats.length > 0;
    case 5: return true; // optional
    case 6: return data.portfolioVideoUrls.filter((u) => u.trim()).length >= 2;
    case 7: return data.rateRangeSelf !== null;
    case 8: return true; // all optional
    case 9: return true;
    default: return true;
  }
}
