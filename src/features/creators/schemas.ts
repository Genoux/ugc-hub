import { z } from "zod";
import {
  AGE_DEMOGRAPHICS,
  CONTENT_FORMATS,
  CREATOR_STATUSES,
  ETHNICITIES,
  GENDER_IDENTITIES,
  OVERALL_RATING_TIERS,
  PRIMARY_CHANNELS,
  RATING_TIERS,
  UGC_CATEGORIES,
} from "./constants";

export const languageTagSchema = z.object({
  language: z.string(),
  accent: z.string().optional(),
});

export const socialChannelsSchema = z.object({
  instagram_handle: z.string().optional(),
  tiktok_handle: z.string().optional(),
  youtube_handle: z.string().optional(),
  other_links: z.array(z.string()).optional(),
});

export const rateRangeSchema = z.object({
  min: z.number(),
  max: z.number(),
});

export const collaborationRatingsSchema = z.object({
  visual_quality: z.enum(RATING_TIERS),
  acting_line_delivery: z.enum(RATING_TIERS),
  reliability_speed: z.enum(RATING_TIERS),
});

export const collaborationSchema = z.object({
  id: z.string(),
  creator_id: z.string(),
  brand: z.string(),
  date: z.string(),
  pieces_of_content: z.number(),
  total_paid: z.number(),
  per_piece_rate: z.number(),
  notes: z.string().optional(),
  ratings: collaborationRatingsSchema,
  content_thumbnails: z.array(z.string()).optional(),
});

export const creatorSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string(),
  email: z.string().email(),
  profilePhoto: z.string().nullable(),
  country: z.string().nullable(),
  genderIdentity: z.enum(GENDER_IDENTITIES).nullable(),
  ageDemographic: z.enum(AGE_DEMOGRAPHICS).nullable(),
  ethnicity: z.enum(ETHNICITIES).nullable(),
  languages: z.array(languageTagSchema).nullable(),
  primaryChannel: z.enum(PRIMARY_CHANNELS).nullable(),
  socialChannels: socialChannelsSchema.nullable(),
  ugcCategories: z.array(z.enum(UGC_CATEGORIES)).nullable(),
  contentFormats: z.array(z.enum(CONTENT_FORMATS)).nullable(),
  rateRangeSelf: rateRangeSchema.nullable(),
  rateRangeInternal: rateRangeSchema.nullable(),
  overallRating: z.enum(OVERALL_RATING_TIERS),
  status: z.enum(CREATOR_STATUSES),
  collaborations: z.array(collaborationSchema),
  blacklistReason: z.string().nullable(),
  blacklistedAt: z.date().nullable(),
  blacklistedBy: z.string().nullable(),
  joinedAt: z.date(),
});

export type Creator = z.infer<typeof creatorSchema>;
export type Collaboration = z.infer<typeof collaborationSchema>;
export type SocialChannels = z.infer<typeof socialChannelsSchema>;
export type RateRange = z.infer<typeof rateRangeSchema>;
export type LanguageTag = z.infer<typeof languageTagSchema>;
