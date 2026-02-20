import { z } from "zod";
import {
  AGE_DEMOGRAPHICS,
  CONTENT_FORMATS,
  DB_CREATOR_STATUSES,
  ETHNICITIES,
  GENDER_IDENTITIES,
  OVERALL_RATING_TIERS,
  PRIMARY_CHANNELS,
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
  portfolioUrl: z.string().nullable(),
  primaryChannel: z.enum(PRIMARY_CHANNELS).nullable(),
  socialChannels: socialChannelsSchema.nullable(),
  ugcCategories: z.array(z.enum(UGC_CATEGORIES)).nullable(),
  contentFormats: z.array(z.enum(CONTENT_FORMATS)).nullable(),
  rateRangeSelf: rateRangeSchema.nullable(),
  rateRangeInternal: rateRangeSchema.nullable(),
  overallRating: z.enum(OVERALL_RATING_TIERS),
  status: z.enum(DB_CREATOR_STATUSES),
  profileCompleted: z.boolean(),
  profileCompletedAt: z.date().nullable().optional(),
  collabCount: z.number(),
  blacklistReason: z.string().nullable(),
  blacklistedAt: z.date().nullable(),
  blacklistedBy: z.string().nullable(),
  joinedAt: z.date().nullable(),
});

export type Creator = z.infer<typeof creatorSchema>;
export type SocialChannels = z.infer<typeof socialChannelsSchema>;
export type RateRange = z.infer<typeof rateRangeSchema>;
export type LanguageTag = z.infer<typeof languageTagSchema>;
