import { z } from "zod";
import {
  CONTENT_FORMATS,
  DB_CREATOR_STATUSES,
  LANGUAGES,
  OVERALL_RATING_TIERS,
  PRIMARY_CHANNELS,
  UGC_CATEGORIES,
} from "@/shared/lib/constants";

export const socialChannelsSchema = z.object({
  instagram_url: z.url().optional(),
  tiktok_url: z.url().optional(),
  youtube_url: z.url().optional(),
  portfolio_url: z.string().optional(),
});

export const rateRangeSchema = z.object({
  min: z.number(),
  max: z.number(),
});

export const creatorSchema = z.object({
  id: z.uuid(),
  fullName: z.string(),
  email: z.string().email(),
  profilePhoto: z.string().nullable(),
  country: z.string().nullable(),
  // z.string() intentionally — enum validation belongs at the input layer (server action),
  // not when reading back from the DB where old values may exist.
  genderIdentity: z.string().nullable(),
  ageDemographic: z.string().nullable(),
  ethnicity: z.array(z.string()).nullable(),
  languages: z.array(z.enum(LANGUAGES)).nullable(),
  portfolioUrl: z.string().nullable(),
  primaryChannel: z.enum(PRIMARY_CHANNELS).nullable(),
  socialChannels: socialChannelsSchema.nullable(),
  // z.string() intentionally — enum validation belongs at the input layer (server action),
  // not when reading back from the DB where old values may exist.
  ugcCategories: z.array(z.enum(UGC_CATEGORIES)).nullable(),
  contentFormats: z.array(z.enum(CONTENT_FORMATS)).nullable(),
  rateRangeSelf: rateRangeSchema.nullable(),
  rateRangeInternal: rateRangeSchema.nullable(),
  overallRating: z.enum(OVERALL_RATING_TIERS),
  status: z.enum(DB_CREATOR_STATUSES),
  profileCompleted: z.boolean(),
  profileCompletedAt: z.date().nullable().optional(),
  collabCount: z.number().default(0),
  blacklistReason: z.string().nullable(),
  blacklistedAt: z.date().nullable(),
  blacklistedBy: z.string().nullable(),
  joinedAt: z.date().nullable(),
});

export type Creator = z.infer<typeof creatorSchema>;
export type SocialChannels = z.infer<typeof socialChannelsSchema>;
export type RateRange = z.infer<typeof rateRangeSchema>;
