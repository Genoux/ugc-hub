export const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "France",
  "Germany",
  "Spain",
  "Italy",
  "Brazil",
  "Mexico",
  "Netherlands",
  "Sweden",
  "Norway",
  "Denmark",
  "Finland",
  "Japan",
  "South Korea",
  "India",
  "South Africa",
  "Nigeria",
  "Other",
];

export const LANGUAGES = [
  "English",
  "French",
  "Spanish",
  "Portuguese",
  "German",
  "Italian",
  "Dutch",
  "Swedish",
  "Norwegian",
  "Danish",
  "Finnish",
  "Japanese",
  "Korean",
  "Hindi",
  "Arabic",
  "Other",
];

export const ACCENTS: Record<string, string[]> = {
  English: ["American", "British", "Australian", "Canadian", "Irish", "South African"],
  French: ["French", "Canadian French", "Belgian"],
  Spanish: ["Castilian", "Latin American", "Mexican"],
  Portuguese: ["European", "Brazilian"],
};

export const RATE_BANDS = [
  { label: "$50 – $150", value: { min: 50, max: 150 } },
  { label: "$150 – $300", value: { min: 150, max: 300 } },
  { label: "$300 – $600", value: { min: 300, max: 600 } },
  { label: "$600 – $1,000", value: { min: 600, max: 1000 } },
  { label: "$1,000+", value: { min: 1000, max: 9999 } },
];

export const GENDER_OPTIONS = ["Woman", "Man", "Non-binary", "Prefer not to say"];

export const ETHNICITY_OPTIONS = [
  "Asian",
  "Black / African",
  "Hispanic / Latino",
  "Middle Eastern",
  "Mixed / Multiracial",
  "White / Caucasian",
  "Prefer not to say",
];

export const BIRTH_YEARS = Array.from({ length: 50 }, (_, i) => String(2006 - i));

export const STEP_TITLES: Record<number, string> = {
  1: "Basic info",
  2: "Social channels",
  3: "UGC categories",
  4: "Content formats",
  5: "Profile photo",
  6: "Portfolio videos",
  7: "Rate range",
  8: "About you",
  9: "Complete",
};

export const STEP_TIPS: Record<number, { heading: string; body: string }> = {
  1: {
    heading: "Keep it real",
    body: "Use your legal name and the country where you primarily create content. This helps brands find the right fit.",
  },
  2: {
    heading: "Link your best channels",
    body: "At least one social handle is required. If you have a portfolio site, include it — it strengthens your application.",
  },
  3: {
    heading: "Be specific",
    body: "Select categories where you have real experience. Quality beats quantity — 2–3 strong niches beat 10 weak ones.",
  },
  4: {
    heading: "Show your range",
    body: "Select every format you're comfortable with. Brands look for creators who can execute multiple styles.",
  },
  5: {
    heading: "First impressions matter",
    body: "Use a clear, well-lit headshot or creator photo. This is what brands see first when browsing the database.",
  },
  6: {
    heading: "Let your work speak",
    body: "Upload 2–5 of your best UGC videos. Brands review these to assess your production quality and on-camera presence.",
  },
  7: {
    heading: "Set fair rates",
    body: "Choose the range that reflects your experience. You can always negotiate per project — this is just a starting point.",
  },
  8: {
    heading: "Help brands find you",
    body: "Demographic info helps brands match creators to their target audience. All fields are optional.",
  },
  9: {
    heading: "You're all set!",
    body: "Your profile is now complete. Brands will be able to discover you in the creator database.",
  },
};
