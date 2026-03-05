export const UGC_CATEGORIES = [
  "Sports & Outdoors",
  "Lifestyle",
  "Beauty",
  "Selfcare & Wellness",
  "Makeup",
  "Travel & Adventure",
  "Tech",
  "Business & Finance",
  "Automotive",
  "Food & Cooking",
  "Fashion",
  "Education",
  "Parenting & Family",
] as const;

export type UgcCategory = (typeof UGC_CATEGORIES)[number];

export const CONTENT_FORMATS = [
  "Aesthetic",
  "ASMR",
  "Humor & Skits",
  "Mobile Apps",
  "Podcasts",
  "Professional Camera",
  "Street Interviews",
  "Product Demo",
  "Unboxing",
  "Testimonial / Review",
  "Voiceover",
  "Tutorial / How-to",
  "UGC-style Ad Read",
] as const;

export type ContentFormat = (typeof CONTENT_FORMATS)[number];

export const GENDER_IDENTITIES = ["Male-presenting", "Female-presenting", "Non-binary"] as const;

export type GenderIdentity = (typeof GENDER_IDENTITIES)[number];

export const AGE_DEMOGRAPHICS = [
  "Teens (13-17)",
  "Young Adults (18-24)",
  "Young Pros (25-34)",
  "Adults (35-54)",
  "Older Adults (55+)",
] as const;

export type AgeDemographic = (typeof AGE_DEMOGRAPHICS)[number];

export const ETHNICITIES = [
  "White/Caucasian",
  "African Descent",
  "East Asian",
  "Middle Eastern",
  "Hispanic/Latino",
  "Mixed/Multi-racial",
  "South Asian",
  "Southeast Asian",
  "Vietnamese",
] as const;

export type Ethnicity = (typeof ETHNICITIES)[number];

//TODO: Add more languages
export const LANGUAGES = [
  "English",
  "English (US)",
  "English (UK)",
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
] as const;

export type Language = (typeof LANGUAGES)[number];

export const PRIMARY_CHANNELS = ["Instagram", "TikTok", "YouTube"] as const;

export const SOCIAL_PLATFORMS = [
  { value: "Instagram", label: "Instagram", handleKey: "instagram_handle" },
  { value: "TikTok", label: "TikTok", handleKey: "tiktok_handle" },
  { value: "YouTube", label: "YouTube", handleKey: "youtube_handle" },
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number]["value"];

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

export const RATE_BANDS = [
  { label: "$50 – $150", value: { min: 50, max: 150 } },
  { label: "$150 – $300", value: { min: 150, max: 300 } },
  { label: "$300 – $600", value: { min: 300, max: 600 } },
  { label: "$600 – $1,000", value: { min: 600, max: 1000 } },
  { label: "$1,000+", value: { min: 1000, max: 9999 } },
];

export type PrimaryChannel = (typeof PRIMARY_CHANNELS)[number];

export const RATING_TIERS = ["standout", "good", "sufficient", "problematic", "untested"] as const;

export type RatingTier = (typeof RATING_TIERS)[number];

export const OVERALL_RATING_TIERS = [
  "top creator",
  "standout",
  "good",
  "sufficient",
  "problematic",
  "blacklisted",
  "untested",
] as const;

export type OverallRatingTier = (typeof OVERALL_RATING_TIERS)[number];

export const RATING_CONFIG = {
  "top creator": { dot: "bg-violet-500" },
  standout: { dot: "bg-emerald-500" },
  good: { dot: "bg-sky-500" },
  sufficient: { dot: "bg-zinc-400" },
  problematic: { dot: "bg-orange-500" },
  untested: { dot: "bg-zinc-300" },
  blacklisted: { dot: "bg-rose-500" },
} satisfies Record<OverallRatingTier, { dot: string }>;

// Actual Postgres enum values (source of truth)
export const DB_CREATOR_STATUSES = [
  "applicant",
  "approved_not_joined",
  "joined",
  "rejected",
  "blacklisted",
] as const;
export type DbCreatorStatus = (typeof DB_CREATOR_STATUSES)[number];

// UI filter labels shown in the database filter panel
export const CREATOR_STATUSES = ["untested", "active", "blacklisted"] as const;
export type CreatorDatabaseStatus = (typeof CREATOR_STATUSES)[number];

export const RATING_LABELS: Record<string, string> = {
  visual_quality: "Visual Quality",
  acting_line_delivery: "Acting & Delivery",
  reliability_speed: "Reliability & Speed",
};

export const EASING_FUNCTION = {
  exponential: [0.16, 1, 0.3, 1],
  quartic: [0.78, 0, 0.22, 1],
} as const;

export const ALLOWED_UPLOAD_MIME_TYPES = ["video/mp4", "video/quicktime"] as const;

export const DEFAULT_UPLOAD_MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB
