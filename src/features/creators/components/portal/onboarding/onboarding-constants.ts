export const EASING_FUNCTION = {
  exponential: [0.16, 1, 0.3, 1],
  quartic: [0.78, 0, 0.22, 1],
} as const;

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

export const STEP_TIPS: Record<number, { header: string; body: string }> = {
  1: {
    header: "What's your name?",
    body: "Use the name our team will see on your profile. You can always update it later.",
  },
  2: {
    header: "Your channels",
    body: "Add the platform where you speak to the camera most often. Multiple platforms are a plus.",
  },
  3: {
    header: "Your niche",
    body: "Select the niches that best describe your content universe.",
  },
  4: {
    header: "Your style",
    body: "Select every format you're comfortable with. Brands look for creators who can execute multiple styles.",
  },
  5: {
    header: "Your look",
    body: "Use a clear, well-lit headshot or creator photo. This is what brands see first when browsing the database.",
  },
  6: {
    header: "Your work",
    body: "Upload 2–5 vertical videos that showcase your on-camera presence and editing style.",
  },
  7: {
    header: "Your rate",
    body: "What do you charge per video?",
  },
  8: {
    header: "About you",
    body: "Help brands find you with some demographic info",
  },
};
