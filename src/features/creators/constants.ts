// Based on prototype ugc-hub-pool/src/data/creatorTypes.ts

export const UGC_CATEGORIES = [
  "Sport & Outdoors",
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

export const GENDER_IDENTITIES = [
  "Male-presenting",
  "Female-presenting",
  "Non-binary",
] as const;

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

export const PRIMARY_CHANNELS = [
  "Instagram",
  "TikTok",
  "YouTube",
] as const;

export type PrimaryChannel = (typeof PRIMARY_CHANNELS)[number];

export const RATING_TIERS = [
  "standout",
  "good",
  "sufficient",
  "problematic",
  "untested",
] as const;

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

export const CREATOR_STATUSES = [
  "untested",
  "active",
  "blacklisted",
] as const;

export type CreatorDatabaseStatus = (typeof CREATOR_STATUSES)[number];

export const RATING_LABELS: Record<keyof CollaborationRatings, string> = {
  visual_quality: "Visual Quality",
  acting_line_delivery: "Acting & Delivery",
  reliability_speed: "Reliability & Speed",
};

export interface LanguageTag {
  language: string;
  accent?: string;
}

export interface SocialChannels {
  instagram_handle?: string;
  tiktok_handle?: string;
  youtube_handle?: string;
  other_links?: string[];
}

export interface RateRange {
  min: number;
  max: number;
}

export interface CollaborationRatings {
  visual_quality: RatingTier;
  acting_line_delivery: RatingTier;
  reliability_speed: RatingTier;
}

export interface Collaboration {
  id: string;
  creator_id: string;
  brand: string;
  date: string;
  pieces_of_content: number;
  total_paid: number;
  per_piece_rate: number;
  notes?: string;
  ratings: CollaborationRatings;
  content_thumbnails?: string[];
}
